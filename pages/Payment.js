class PaymentSystem {
  constructor() {
    // Initialize all data structures for the payment system
    this.transactions = new Map(); // Stores all transactions
    this.users = new Map(); // Stores all registered users
    this.disputes = new Map(); // Stores all disputes
    this.escrowAccounts = new Map(); // Stores all escrow accounts
    this.nextTransactionId = 1000; // Counter for generating transaction IDs
    this.nextDisputeId = 2000; // Counter for generating dispute IDs
    this.feePercentage = 0.05; // System fee percentage (5%)
    this.currency = 'USD'; // Default currency
    this.systemBalance = 0; // System's balance from fees
  }

  // Register a new user in the system
  registerUser(userId, userType, initialBalance = 0) {
    if (this.users.has(userId)) {
      throw new Error('User already registered');
    }

    // Create user object with default properties
    this.users.set(userId, {
      type: userType,
      balance: initialBalance,
      paymentMethods: [],
      transactions: [],
      rating: userType === 'freelancer' ? 5 : null, // Freelancers start with 5 rating
      completedJobs: 0,
      totalEarned: 0,
      totalSpent: 0
    });

    return this.getUser(userId);
  }

  // Get user details by userId
  getUser(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    return { userId, ...user };
  }

  // Add a payment method for a user
  addPaymentMethod(userId, methodDetails) {
    const user = this.getUser(userId);
    // Generate unique payment method ID
    const methodId = `pm_${userId}_${user.paymentMethods.length + 1}`;

    // Validate payment method type
    if (!methodDetails.type || !['card', 'bank', 'paypal', 'crypto'].includes(methodDetails.type)) {
      throw new Error('Invalid payment method type');
    }

    // Additional validation for card payments
    if (methodDetails.type === 'card' && !this.validateCard(methodDetails.cardNumber)) {
      throw new Error('Invalid card number');
    }

    // Create new payment method object
    const newMethod = {
      id: methodId,
      ...methodDetails,
      isDefault: user.paymentMethods.length === 0 // First method becomes default
    };

    user.paymentMethods.push(newMethod);
    return methodId;
  }

  // Validate credit card number using Luhn algorithm
  validateCard(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let alternate = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      sum += digit;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  // Deposit funds into user's account
  async deposit(userId, amount, paymentMethodId, currency = this.currency) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const user = this.getUser(userId);

    // Verify payment method exists
    const paymentMethod = user.paymentMethods.find(m => m.id === paymentMethodId);
    if (!paymentMethod) throw new Error('Payment method not found');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update user balance and record transaction
    user.balance += amount;
    this.recordTransaction({
      id: this.generateTransactionId(),
      from: 'external',
      to: userId,
      amount,
      currency,
      type: 'deposit',
      status: 'completed',
      timestamp: new Date()
    });

    return user.balance;
  }

  // Withdraw funds from user's account
  async withdraw(userId, amount, paymentMethodId, currency = this.currency) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const user = this.getUser(userId);

    if (user.balance < amount) {
      throw new Error('Insufficient funds');
    }

    const paymentMethod = user.paymentMethods.find(m => m.id === paymentMethodId);
    if (!paymentMethod) throw new Error('Payment method not found');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update user balance and record transaction
    user.balance -= amount;
    this.recordTransaction({
      id: this.generateTransactionId(),
      from: userId,
      to: 'external',
      amount,
      currency,
      type: 'withdrawal',
      status: 'completed',
      timestamp: new Date()
    });

    return user.balance;
  }

  // Create an escrow payment between client and freelancer
  async createEscrowPayment(clientId, freelancerId, amount, description, currency = this.currency) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const client = this.getUser(clientId);
    const freelancer = this.getUser(freelancerId);

    // Validate user types
    if (client.type !== 'client') throw new Error('Sender must be a client');
    if (freelancer.type !== 'freelancer') throw new Error('Recipient must be a freelancer');
    if (client.balance < amount) throw new Error('Insufficient funds');

    // Calculate system fee
    const fee = this.calculateFee(amount);
    const totalAmount = amount + fee;

    // Deduct funds from client
    client.balance -= totalAmount;

    // Create escrow account
    const escrowId = `escrow_${this.generateTransactionId()}`;
    const transactionId = this.generateTransactionId();

    this.escrowAccounts.set(escrowId, {
      id: escrowId,
      clientId,
      freelancerId,
      amount,
      fee,
      currency,
      description,
      status: 'pending',
      createdAt: new Date(),
      transactionId
    });

    // Record the escrow transaction
    this.recordTransaction({
      id: transactionId,
      from: clientId,
      to: escrowId,
      amount: totalAmount,
      currency,
      type: 'escrow',
      status: 'pending',
      timestamp: new Date(),
      description
    });

    return { escrowId, transactionId };
  }

  // Release funds from escrow to freelancer
  async releaseEscrow(escrowId, releasedBy) {
    const escrow = this.escrowAccounts.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.status !== 'pending') throw new Error('Escrow already processed');

    const client = this.getUser(escrow.clientId);
    const freelancer = this.getUser(escrow.freelancerId);

    // Update escrow status
    escrow.status = 'released';
    escrow.releasedAt = new Date();
    escrow.releasedBy = releasedBy;

    // Transfer funds to freelancer and update stats
    freelancer.balance += escrow.amount;
    freelancer.completedJobs += 1;
    freelancer.totalEarned += escrow.amount;

    // Collect system fee
    this.systemBalance += escrow.fee;

    // Update original transaction status
    const transaction = this.getTransaction(escrow.transactionId);
    transaction.status = 'completed';

    // Record the release transaction
    this.recordTransaction({
      id: this.generateTransactionId(),
      from: escrowId,
      to: freelancer.userId,
      amount: escrow.amount,
      currency: escrow.currency,
      type: 'escrow_release',
      status: 'completed',
      timestamp: new Date(),
      description: escrow.description
    });

    return { success: true, amount: escrow.amount };
  }

  // Refund escrow funds back to client
  async refundEscrow(escrowId, refundedBy, reason) {
    const escrow = this.escrowAccounts.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.status !== 'pending') throw new Error('Escrow already processed');

    const client = this.getUser(escrow.clientId);

    // Update escrow status
    escrow.status = 'refunded';
    escrow.refundedAt = new Date();
    escrow.refundedBy = refundedBy;
    escrow.refundReason = reason;

    // Return funds to client (including fee)
    client.balance += escrow.amount + escrow.fee;

    // Update original transaction status
    const transaction = this.getTransaction(escrow.transactionId);
    transaction.status = 'refunded';

    // Record the refund transaction
    this.recordTransaction({
      id: this.generateTransactionId(),
      from: escrowId,
      to: client.userId,
      amount: escrow.amount + escrow.fee,
      currency: escrow.currency,
      type: 'escrow_refund',
      status: 'completed',
      timestamp: new Date(),
      description: `Refund: ${escrow.description}`
    });

    return { success: true, amount: escrow.amount + escrow.fee };
  }

  // Make a direct payment (no escrow) from client to freelancer
  async directPayment(clientId, freelancerId, amount, description, currency = this.currency) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const client = this.getUser(clientId);
    const freelancer = this.getUser(freelancerId);

    // Validate user types and balance
    if (client.type !== 'client') throw new Error('Sender must be a client');
    if (freelancer.type !== 'freelancer') throw new Error('Recipient must be a freelancer');
    if (client.balance < amount) throw new Error('Insufficient funds');

    // Calculate and deduct total amount (payment + fee)
    const fee = this.calculateFee(amount);
    const totalAmount = amount + fee;

    client.balance -= totalAmount;
    freelancer.balance += amount;
    this.systemBalance += fee;

    // Update user statistics
    freelancer.completedJobs += 1;
    freelancer.totalEarned += amount;
    client.totalSpent += totalAmount;

    const transactionId = this.generateTransactionId();

    // Record the direct payment transaction
    this.recordTransaction({
      id: transactionId,
      from: clientId,
      to: freelancerId,
      amount: amount,
      fee: fee,
      currency: currency,
      type: 'direct',
      status: 'completed',
      timestamp: new Date(),
      description: description
    });

    return { transactionId, amount, fee };
  }

  // Create a dispute for an escrow payment
  createDispute(escrowId, createdBy, reason) {
    const escrow = this.escrowAccounts.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.status !== 'pending') throw new Error('Escrow already processed');
    if (createdBy !== escrow.clientId && createdBy !== escrow.freelancerId) {
      throw new Error('Only client or freelancer can create dispute');
    }

    // Create new dispute
    const disputeId = this.generateDisputeId();
    this.disputes.set(disputeId, {
      id: disputeId,
      escrowId,
      createdBy,
      reason,
      status: 'open',
      createdAt: new Date(),
      resolvedAt: null,
      resolution: null
    });

    // Update escrow status
    escrow.status = 'disputed';
    return disputeId;
  }

  // Resolve an open dispute
  resolveDispute(disputeId, resolvedBy, resolution, amountToFreelancer) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error('Dispute not found');
    if (dispute.status !== 'open') throw new Error('Dispute already resolved');

    const escrow = this.escrowAccounts.get(dispute.escrowId);
    if (!escrow) throw new Error('Escrow not found');

    const client = this.getUser(escrow.clientId);
    const freelancer = this.getUser(escrow.freelancerId);

    // Validate resolution amount
    if (amountToFreelancer < 0 || amountToFreelancer > escrow.amount) {
      throw new Error('Invalid resolution amount');
    }

    // Update dispute status
    dispute.status = 'resolved';
    dispute.resolvedAt = new Date();
    dispute.resolvedBy = resolvedBy;
    dispute.resolution = resolution;
    dispute.amountToFreelancer = amountToFreelancer;

    // Distribute funds based on resolution
    if (amountToFreelancer > 0) {
      freelancer.balance += amountToFreelancer;
      freelancer.completedJobs += 1;
      freelancer.totalEarned += amountToFreelancer;
    }

    const refundAmount = escrow.amount - amountToFreelancer;
    if (refundAmount > 0) {
      client.balance += refundAmount;
    }

    // Collect system fee
    this.systemBalance += escrow.fee;

    // Update escrow status
    escrow.status = 'dispute_resolved';

    // Record transactions for the resolution
    if (amountToFreelancer > 0) {
      this.recordTransaction({
        id: this.generateTransactionId(),
        from: dispute.escrowId,
        to: freelancer.userId,
        amount: amountToFreelancer,
        currency: escrow.currency,
        type: 'dispute_resolution',
        status: 'completed',
        timestamp: new Date(),
        description: `Dispute resolution: ${resolution}`
      });
    }

    if (refundAmount > 0) {
      this.recordTransaction({
        id: this.generateTransactionId(),
        from: dispute.escrowId,
        to: client.userId,
        amount: refundAmount,
        currency: escrow.currency,
        type: 'dispute_refund',
        status: 'completed',
        timestamp: new Date(),
        description: `Dispute refund: ${resolution}`
      });
    }

    return { success: true, amountToFreelancer, refundAmount };
  }

  // Get transaction details by ID
  getTransaction(transactionId) {
    // Check user transactions first
    for (const [_, user] of this.users) {
      const transaction = user.transactions.find(t => t.id === transactionId);
      if (transaction) return transaction;
    }
    
    // Check system transactions
    if (this.transactions.has(transactionId)) {
      return this.transactions.get(transactionId);
    }
    
    throw new Error('Transaction not found');
  }

  // Get all transactions for a user
  getUserTransactions(userId) {
    const user = this.getUser(userId);
    return user.transactions;
  }

  // Get escrow account details
  getEscrowDetails(escrowId) {
    const escrow = this.escrowAccounts.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    return escrow;
  }

  // Get dispute details
  getDisputeDetails(disputeId) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error('Dispute not found');
    return dispute;
  }

  // Generate a unique transaction ID
  generateTransactionId() {
    return `tx_${this.nextTransactionId++}`;
  }

  // Generate a unique dispute ID
  generateDisputeId() {
    return `dp_${this.nextDisputeId++}`;
  }

  // Calculate system fee for a transaction
  calculateFee(amount) {
    return Math.round(amount * this.feePercentage * 100) / 100;
  }

  // Record a transaction in the system
  recordTransaction(transaction) {
    // Add transaction to sender's history (if not external/system)
    if (transaction.from !== 'external' && transaction.from !== 'system') {
      const sender = this.getUser(transaction.from);
      sender.transactions.push(transaction);
    }

    // Add transaction to receiver's history (if not external/system)
    if (transaction.to !== 'external' && transaction.to !== 'system') {
      const receiver = this.getUser(transaction.to);
      receiver.transactions.push(transaction);
    }

    // Store transaction in system-wide transactions map
    this.transactions.set(transaction.id, transaction);
  }
}

module.exports = PaymentSystem;