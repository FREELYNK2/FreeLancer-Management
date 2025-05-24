// account.js - Profile Management Module

/**
 * User Profile Class
 */
class UserProfile {
  constructor(userId, username, email, firstName, lastName) {
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePicture = null;
    this.bio = '';
    this.website = '';
    this.location = '';
    this.joinDate = new Date();
    this.lastLogin = new Date();
    this.isVerified = false;
    this.isPrivate = false;
    this.followers = [];
    this.following = [];
    this.socialLinks = {};
    this.preferences = {
      theme: 'light',
      notifications: true,
      language: 'en'
    };
  }

  /**
   * Update basic profile information
   */
  updateProfileInfo({ firstName, lastName, bio, website, location }) {
    if (firstName !== undefined) this.firstName = firstName;
    if (lastName !== undefined) this.lastName = lastName;
    if (bio !== undefined) this.bio = bio;
    if (website !== undefined) this.website = website;
    if (location !== undefined) this.location = location;
    return this;
  }

  /**
   * Update profile picture
   */
  updateProfilePicture(url) {
    if (typeof url !== 'string' || !url.match(/\.(jpeg|jpg|gif|png)$/)) {
      throw new Error('Invalid image URL');
    }
    this.profilePicture = url;
    return this;
  }

  /**
   * Update user preferences
   */
  updatePreferences({ theme, notifications, language }) {
    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      this.preferences.theme = theme;
    }
    if (notifications !== undefined) {
      this.preferences.notifications = Boolean(notifications);
    }
    if (language && ['en', 'es', 'fr', 'de'].includes(language)) {
      this.preferences.language = language;
    }
    return this;
  }

  /**
   * Add a social link
   */
  addSocialLink(platform, url) {
    const validPlatforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'github'];
    if (!validPlatforms.includes(platform)) {
      throw new Error('Invalid social platform');
    }
    if (typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error('Invalid URL');
    }
    this.socialLinks[platform] = url;
    return this;
  }

  /**
   * Remove a social link
   */
  removeSocialLink(platform) {
    if (this.socialLinks[platform]) {
      delete this.socialLinks[platform];
    }
    return this;
  }

  /**
   * Toggle account privacy
   */
  togglePrivacy() {
    this.isPrivate = !this.isPrivate;
    return this;
  }

  /**
   * Follow another user
   */
  followUser(userId) {
    if (!this.following.includes(userId)) {
      this.following.push(userId);
    }
    return this;
  }

  /**
   * Unfollow a user
   */
  unfollowUser(userId) {
    this.following = this.following.filter(id => id !== userId);
    return this;
  }

  /**
   * Add a follower
   */
  addFollower(userId) {
    if (!this.followers.includes(userId)) {
      this.followers.push(userId);
    }
    return this;
  }

  /**
   * Remove a follower
   */
  removeFollower(userId) {
    this.followers = this.followers.filter(id => id !== userId);
    return this;
  }

  /**
   * Get profile data for public view
   */
  getPublicProfile() {
    return {
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      bio: this.bio,
      profilePicture: this.profilePicture,
      website: this.website,
      location: this.location,
      joinDate: this.joinDate,
      isVerified: this.isVerified,
      socialLinks: this.socialLinks,
      followersCount: this.followers.length,
      followingCount: this.following.length,
      isPrivate: this.isPrivate
    };
  }

  /**
   * Get full profile data (for private/owner view)
   */
  getFullProfile() {
    return {
      userId: this.userId,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      bio: this.bio,
      profilePicture: this.profilePicture,
      website: this.website,
      location: this.location,
      joinDate: this.joinDate,
      lastLogin: this.lastLogin,
      isVerified: this.isVerified,
      isPrivate: this.isPrivate,
      socialLinks: this.socialLinks,
      followers: this.followers,
      following: this.following,
      preferences: this.preferences
    };
  }
}

/**
 * Profile Manager - Manages multiple user profiles
 */
class ProfileManager {
  constructor() {
    this.profiles = new Map();
    this.usernameIndex = new Map();
    this.emailIndex = new Map();
  }

  /**
   * Create a new user profile
   */
  createProfile(userId, username, email, firstName, lastName) {
    if (this.profiles.has(userId)) {
      throw new Error('User ID already exists');
    }
    if (this.usernameIndex.has(username)) {
      throw new Error('Username already taken');
    }
    if (this.emailIndex.has(email)) {
      throw new Error('Email already registered');
    }

    const profile = new UserProfile(userId, username, email, firstName, lastName);
    this.profiles.set(userId, profile);
    this.usernameIndex.set(username, userId);
    this.emailIndex.set(email, userId);
    return profile;
  }

  /**
   * Get profile by user ID
   */
  getProfileById(userId) {
    return this.profiles.get(userId);
  }

  /**
   * Get profile by username
   */
  getProfileByUsername(username) {
    const userId = this.usernameIndex.get(username);
    return userId ? this.profiles.get(userId) : null;
  }

  /**
   * Get profile by email
   */
  getProfileByEmail(email) {
    const userId = this.emailIndex.get(email);
    return userId ? this.profiles.get(userId) : null;
  }

  /**
   * Delete a profile
   */
  deleteProfile(userId) {
    const profile = this.profiles.get(userId);
    if (profile) {
      this.usernameIndex.delete(profile.username);
      this.emailIndex.delete(profile.email);
      this.profiles.delete(userId);
      return true;
    }
    return false;
  }

  /**
   * Search profiles by name or username
   */
  searchProfiles(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [userId, profile] of this.profiles) {
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
      if (
        profile.username.toLowerCase().includes(queryLower) ||
        fullName.includes(queryLower)
      ) {
        results.push(profile.getPublicProfile());
      }
    }
    
    return results;
  }

  /**
   * Verify a user's email
   */
  verifyUser(userId) {
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.isVerified = true;
      return true;
    }
    return false;
  }

  /**
   * Update last login time
   */
  updateLastLogin(userId) {
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.lastLogin = new Date();
      return true;
    }
    return false;
  }
}

// Export the ProfileManager class
module.exports = { UserProfile, ProfileManager };