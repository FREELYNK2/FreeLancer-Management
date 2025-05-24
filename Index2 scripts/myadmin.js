
class AdminSystem {
  constructor() {
    this.users = new Map();         
    this.projects = new Map();      
    this.suspendedAccounts = new Map(); 
    this.deletedAccounts = new Map();   
    this.activityLog = [];          
  }

  
  addUser(userId, userType, userData) {
    if (this.users.has(userId)) {
      throw new Error('User already exists');
    }

    const validTypes = ['client', 'freelancer'];
    if (!validTypes.includes(userType)) {
      throw new Error('Invalid user type');
    }

    const newUser = {
      id: userId,
      type: userType,
      ...userData,
      joinDate: new Date(),
      lastActive: new Date(),
      isVerified: false,
      isSuspended: false,
      isDeleted: false
    };

    this.users.set(userId, newUser);
    this.logActivity('add_user', `Added ${userType} ${userId}`);
    return newUser;
  }

  
  getUser(userId) {
    if (this.deletedAccounts.has(userId)) {
      throw new Error('User has been deleted');
    }

    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  
  verifyUser(userId) {
    const user = this.getUser(userId);
    user.isVerified = true;
    this.logActivity('verify_user', `Verified user ${userId}`);
    return user;
  }

  
  suspendUser(userId, reason) {
    const user = this.getUser(userId);
    user.isSuspended = true;
    this.suspendedAccounts.set(userId, {
      user,
      suspendedAt: new Date(),
      reason
    });
    this.logActivity('suspend_user', `Suspended user ${userId}: ${reason}`);
    return true;
  }

  
  unsuspendUser(userId) {
    const user = this.getUser(userId);
    if (!user.isSuspended) {
      throw new Error('User is not suspended');
    }

    user.isSuspended = false;
    this.suspendedAccounts.delete(userId);
    this.logActivity('unsuspend_user', `Unsuspended user ${userId}`);
    return true;
  }

  
  deleteUser(userId, adminId, reason = 'No reason provided') {
    const user = this.getUser(userId);
    
    
    if (this.hasActiveProjects(userId)) {
      throw new Error('Cannot delete user with active projects');
    }

   
    user.isDeleted = true;
    this.deletedAccounts.set(userId, {
      user: { ...user },
      deletedAt: new Date(),
      deletedBy: adminId,
      reason
    });

    
    this.users.delete(userId);
    
    
    if (this.suspendedAccounts.has(userId)) {
      this.suspendedAccounts.delete(userId);
    }

    this.logActivity('delete_user', `Deleted user ${userId}: ${reason}`);
    return true;
  }

  
  permanentDeleteUser(userId, adminId) {
    if (!this.deletedAccounts.has(userId)) {
      throw new Error('User not found in deleted accounts');
    }

    const deletedUser = this.deletedAccounts.get(userId);
    this.deletedAccounts.delete(userId);
    this.logActivity('permanent_delete', `Permanently deleted user ${userId}`, adminId);
    return deletedUser;
  }

  
  restoreUser(userId, adminId) {
    if (!this.deletedAccounts.has(userId)) {
      throw new Error('User not found in deleted accounts');
    }

    const deletedUser = this.deletedAccounts.get(userId).user;
    deletedUser.isDeleted = false;
    this.users.set(userId, deletedUser);
    this.deletedAccounts.delete(userId);
    this.logActivity('restore_user', `Restored user ${userId}`, adminId);
    return deletedUser;
  }

  hasActiveProjects(userId) {
    for (const [_, project] of this.projects) {
      if (project.clientId === userId || project.freelancerId === userId) {
        if (project.status === 'active' || project.status === 'in-progress') {
          return true;
        }
      }
    }
    return false;
  }

  
  getAllUsers(filter = {}) {
    const users = [];
    for (const [userId, user] of this.users) {
      let match = true;
      
      
      if (filter.type && user.type !== filter.type) match = false;
      if (filter.verified && user.isVerified !== filter.verified) match = false;
      if (filter.suspended && user.isSuspended !== filter.suspended) match = false;
      
      if (match) {
        users.push({
          id: userId,
          type: user.type,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          isSuspended: user.isSuspended,
          joinDate: user.joinDate,
          lastActive: user.lastActive
        });
      }
    }
    return users;
  }

  
  getSuspendedUsers() {
    return Array.from(this.suspendedAccounts.values()).map(account => ({
      ...account.user,
      suspendedAt: account.suspendedAt,
      reason: account.reason
    }));
  }

  
  getDeletedUsers() {
    return Array.from(this.deletedAccounts.values()).map(account => ({
      ...account.user,
      deletedAt: account.deletedAt,
      deletedBy: account.deletedBy,
      reason: account.reason
    }));
  }

  
  getActivityLog(limit = 100) {
    return this.activityLog.slice(0, limit);
  }

  
  logActivity(action, description, adminId = 'system') {
    this.activityLog.push({
      timestamp: new Date(),
      action,
      description,
      adminId
    });
    
    
    if (this.activityLog.length > 1000) {
      this.activityLog.shift();
    }
  }
}

module.exports = AdminSystem;