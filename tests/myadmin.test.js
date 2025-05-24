const AdminSystem = require('../Index2 scripts/myadmin.js');
const assert = require('assert');

describe('AdminSystem', () => {
  let admin;
  const clientId = 'client1';
  const freelancerId = 'freelancer1';
  const adminId = 'admin1';

  beforeEach(() => {
    admin = new AdminSystem();
    
    // Add test users
    admin.addUser(clientId, 'client', {
      name: 'Test Client',
      email: 'client@test.com'
    });
    
    admin.addUser(freelancerId, 'freelancer', {
      name: 'Test Freelancer',
      email: 'freelancer@test.com',
      skills: ['web development']
    });
  });

  afterEach(() => {
    admin = null;
  });

  describe('User Management', () => {
    it('should add new users', () => {
      const client = admin.getUser(clientId);
      assert.strictEqual(client.type, 'client');
      assert.strictEqual(client.name, 'Test Client');
      assert.strictEqual(client.isVerified, false);
    });

    it('should prevent duplicate users', () => {
      assert.throws(() => {
        admin.addUser(clientId, 'client', {
          name: 'Duplicate',
          email: 'duplicate@test.com'
        });
      }, Error);
    });

    it('should verify users', () => {
      admin.verifyUser(clientId);
      const client = admin.getUser(clientId);
      assert.strictEqual(client.isVerified, true);
    });
  });

  describe('Suspension System', () => {
    it('should suspend users', () => {
      admin.suspendUser(freelancerId, 'Test suspension');
      const freelancer = admin.getUser(freelancerId);
      assert.strictEqual(freelancer.isSuspended, true);
      
      const suspended = admin.getSuspendedUsers();
      assert.strictEqual(suspended.length, 1);
      assert.strictEqual(suspended[0].id, freelancerId);
    });

    it('should unsuspend users', () => {
      admin.suspendUser(freelancerId, 'Test suspension');
      admin.unsuspendUser(freelancerId);
      
      const freelancer = admin.getUser(freelancerId);
      assert.strictEqual(freelancer.isSuspended, false);
      assert.strictEqual(admin.getSuspendedUsers().length, 0);
    });

    it('should prevent unsuspending non-suspended users', () => {
      assert.throws(() => admin.unsuspendUser(freelancerId), Error);
    });
  });

  describe('Deletion System', () => {
    it('should soft delete users', () => {
      admin.deleteUser(clientId, adminId, 'Test deletion');
      
      
      const deleted = admin.getDeletedUsers();
      assert.strictEqual(deleted.length, 1);
      assert.strictEqual(deleted[0].id, clientId);
      
      
      assert.throws(() => admin.getUser(clientId), Error);
    });

    it('should restore deleted users', () => {
      admin.deleteUser(clientId, adminId);
      admin.restoreUser(clientId, adminId);
      
      const client = admin.getUser(clientId);
      assert.strictEqual(client.isDeleted, false);
      assert.strictEqual(admin.getDeletedUsers().length, 0);
    });

    it('should permanently delete users', () => {
      admin.deleteUser(clientId, adminId);
      const deletedUser = admin.permanentDeleteUser(clientId, adminId);
      
      assert.strictEqual(deletedUser.user.id, clientId);
      assert.strictEqual(admin.getDeletedUsers().length, 0);
    });

    it('should prevent deleting users with active projects', () => {
      
      admin.projects.set('proj1', {
        clientId,
        freelancerId,
        status: 'active'
      });
      
      assert.throws(() => admin.deleteUser(clientId, adminId), Error);
    });
  });

  describe('User Retrieval', () => {
    it('should get all users with filtering', () => {
      
      admin.verifyUser(clientId);
      
      const allUsers = admin.getAllUsers();
      assert.strictEqual(allUsers.length, 2);
      
      const clients = admin.getAllUsers({ type: 'client' });
      assert.strictEqual(clients.length, 1);
      assert.strictEqual(clients[0].id, clientId);
      
      const verifiedUsers = admin.getAllUsers({ verified: true });
      assert.strictEqual(verifiedUsers.length, 1);
      assert.strictEqual(verifiedUsers[0].id, clientId);
    });

    it('should not return deleted users in getAllUsers', () => {
      admin.deleteUser(clientId, adminId);
      const users = admin.getAllUsers();
      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].id, freelancerId);
    });
  });

  describe('Activity Logging', () => {
    it('should log admin activities', () => {
      admin.suspendUser(freelancerId, 'Test');
      admin.deleteUser(clientId, adminId);
      
      const log = admin.getActivityLog();
      assert.strictEqual(log.length, 4); 
      
      assert(log.some(entry => entry.action === 'suspend_user'));
      assert(log.some(entry => entry.action === 'delete_user'));
    });
  });
});