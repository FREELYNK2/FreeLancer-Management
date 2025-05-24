const PaymentSystem = require('../pages/Payment');
const assert = require('assert');

describe('PaymentSystem', () => {
  let paymentSystem;

  beforeEach(() => {
    paymentSystem = new PaymentSystem();
    paymentSystem.registerUser('client1', 'client', 1000);
    paymentSystem.registerUser('freelancer1', 'freelancer', 0);
    paymentSystem.registerUser('admin1', 'admin', 0);
    paymentSystem.addPaymentMethod('client1', {
      type: 'card',
      cardNumber: '4111111111111111',
      expiry: '12/25',
      name: 'Test User'
    });
  });

  afterEach(() => {
    paymentSystem = null;
  });

  describe('User Registration', () => {
    it('should register new users', () => {
      const client = paymentSystem.getUser('client1');
      assert.strictEqual(client.type, 'client');
      assert.strictEqual(client.balance, 1000);

      const freelancer = paymentSystem.getUser('freelancer1');
      assert.strictEqual(freelancer.type, 'freelancer');
      assert.strictEqual(freelancer.balance, 0);
    });

    it('should prevent duplicate user registration', () => {
      assert.throws(() => paymentSystem.registerUser('client1', 'client'), Error);
    });
  });

  describe('Payment Methods', () => {
    it('should add valid payment methods', () => {
      const methodId = paymentSystem.addPaymentMethod('client1', {
        type: 'bank',
        accountNumber: '12345678',
        routingNumber: '021000021'
      });
      assert(methodId.startsWith('pm_client1_'));
    });

    it('should validate credit card numbers', () => {
      assert.doesNotThrow(() => paymentSystem.addPaymentMethod('client1', {
        type: 'card',
        cardNumber: '5555555555554444',
        expiry: '12/25',
        name: 'Test User'
      }));

      assert.throws(() => paymentSystem.addPaymentMethod('client1', {
        type: 'card',
        cardNumber: '1234567812345678',
        expiry: '12/25',
        name: 'Test User'
      }), Error);
    });
  });

  describe('Deposits and Withdrawals', () => {
    it('should process deposits', async () => {
      const newBalance = await paymentSystem.deposit('client1', 500, 'pm_client1_1');
      assert.strictEqual(newBalance, 1500);
    });

    it('should reject invalid deposits', async () => {
      await assert.rejects(async () => {
        await paymentSystem.deposit('client1', -100, 'pm_client1_1');
      }, Error);

      await assert.rejects(async () => {
        await paymentSystem.deposit('client1', 100, 'invalid_method');
      }, Error);
    });

    it('should process withdrawals', async () => {
      const newBalance = await paymentSystem.withdraw('client1', 200, 'pm_client1_1');
      assert.strictEqual(newBalance, 800);
    });

    it('should reject invalid withdrawals', async () => {
      await assert.rejects(async () => {
        await paymentSystem.withdraw('client1', 2000, 'pm_client1_1');
      }, Error);

      await assert.rejects(async () => {
        await paymentSystem.withdraw('client1', -100, 'pm_client1_1');
      }, Error);
    });
  });

  describe('Escrow Payments', () => {
    let escrowId, transactionId;

    beforeEach(async () => {
      const result = await paymentSystem.createEscrowPayment('client1', 'freelancer1', 500, 'Website development');
      escrowId = result.escrowId;
      transactionId = result.transactionId;
    });

    it.skip('should create escrow payments', () => {
      const escrow = paymentSystem.getEscrowDetails(escrowId);
      assert.strictEqual(escrow.status, 'pending');
      assert.strictEqual(escrow.amount, 500);

      const client = paymentSystem.getUser('client1');
      assert.strictEqual(client.balance, 475); // 1000 - (500 + 25 fee)
    });

    it.skip('should release escrow to freelancer', async () => {
      const result = await paymentSystem.releaseEscrow(escrowId, 'client1');
      assert.strictEqual(result.amount, 500);

      const escrow = paymentSystem.getEscrowDetails(escrowId);
      assert.strictEqual(escrow.status, 'released');

      const freelancer = paymentSystem.getUser('freelancer1');
      assert.strictEqual(freelancer.balance, 500);
      assert.strictEqual(freelancer.completedJobs, 1);
    });

    it.skip('should refund escrow to client', async () => {
      const result = await paymentSystem.refundEscrow(escrowId, 'client1', 'Project cancelled');
      assert.strictEqual(result.amount, 525); // 500 + 25 fee

      const escrow = paymentSystem.getEscrowDetails(escrowId);
      assert.strictEqual(escrow.status, 'refunded');

      const client = paymentSystem.getUser('client1');
      assert.strictEqual(client.balance, 1000); // Full refund
    });
  });

  describe('Direct Payments', () => {
    it.skip('should process direct payments', async () => {
      const result = await paymentSystem.directPayment('client1', 'freelancer1', 300, 'Logo design');
      assert.strictEqual(result.amount, 300);
      assert.strictEqual(result.fee, 15); // 5% of 300

      const client = paymentSystem.getUser('client1');
      assert.strictEqual(client.balance, 685); // 1000 - (300 + 15)

      const freelancer = paymentSystem.getUser('freelancer1');
      assert.strictEqual(freelancer.balance, 300);
      assert.strictEqual(freelancer.completedJobs, 1);
    });

    it('should reject invalid direct payments', async () => {
      await assert.rejects(async () => {
        await paymentSystem.directPayment('client1', 'freelancer1', 2000, 'Too much');
      }, Error);

      await assert.rejects(async () => {
        await paymentSystem.directPayment('freelancer1', 'client1', 100, 'Wrong direction');
      }, Error);
    });
  });

  describe('Disputes', () => {
    let escrowId, disputeId;

    beforeEach(async () => {
      const result = await paymentSystem.createEscrowPayment('client1', 'freelancer1', 500, 'Website development');
      escrowId = result.escrowId;
      disputeId = paymentSystem.createDispute(escrowId, 'client1', 'Work not delivered');
    });

    it.skip('should create disputes', () => {
      const dispute = paymentSystem.getDisputeDetails(disputeId);
      assert.strictEqual(dispute.status, 'open');
      assert.strictEqual(dispute.reason, 'Work not delivered');

      const escrow = paymentSystem.getEscrowDetails(escrowId);
      assert.strictEqual(escrow.status, 'disputed');
    });

    it.skip('should resolve disputes', () => {
      const result = paymentSystem.resolveDispute(disputeId, 'admin1', 'Partial work completed', 300);
      assert.strictEqual(result.amountToFreelancer, 300);
      assert.strictEqual(result.refundAmount, 200);

      const dispute = paymentSystem.getDisputeDetails(disputeId);
      assert.strictEqual(dispute.status, 'resolved');

      const client = paymentSystem.getUser('client1');
      assert.strictEqual(client.balance, 700); // Initial 1000 - 525 escrow + 200 refund

      const freelancer = paymentSystem.getUser('freelancer1');
      assert.strictEqual(freelancer.balance, 300);
      assert.strictEqual(freelancer.completedJobs, 1);
    });

    it.skip('should reject invalid dispute resolutions', () => {
      assert.throws(() => {
        paymentSystem.resolveDispute(disputeId, 'admin1', 'Invalid resolution', 600);
      }, Error);
    });
  });

  describe('Transactions', () => {
    it('should record transactions', async () => {
      await paymentSystem.directPayment('client1', 'freelancer1', 100, 'Small task');
      
      const clientTx = paymentSystem.getUserTransactions('client1');
      assert.strictEqual(clientTx.length, 1);
      assert.strictEqual(clientTx[0].amount, 100);

      const freelancerTx = paymentSystem.getUserTransactions('freelancer1');
      assert.strictEqual(freelancerTx.length, 1);
      assert.strictEqual(freelancerTx[0].amount, 100);
    });

    it('should retrieve transaction details', async () => {
      const { transactionId } = await paymentSystem.directPayment('client1', 'freelancer1', 100, 'Small task');
      const tx = paymentSystem.getTransaction(transactionId);
      assert.strictEqual(tx.description, 'Small task');
    });
  });
});