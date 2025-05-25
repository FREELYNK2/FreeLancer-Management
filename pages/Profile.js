class UserProfile {
  constructor(userId, username, email, firstName, lastName) {
    this.userId = userId; // Unique user identifier
    this.username = username; // User's display name
    this.email = email; // User's email address
    this.firstName = firstName; // User's first name
    this.lastName = lastName; // User's last name
    this.profilePicture = null; // URL to profile image
    this.bio = ''; // User description
    this.website = ''; // Personal website URL
    this.location = ''; // Physical location
    this.joinDate = new Date(); // Account creation timestamp
    this.lastLogin = new Date(); // Last active timestamp
    this.isVerified = false; // Account verification status
    this.isPrivate = false; // Profile visibility flag
    this.followers = []; // Array of follower user IDs
    this.following = []; // Array of followed user IDs
    this.socialLinks = {}; // Key-value pairs of social media links
    this.preferences = { // User settings
      theme: 'light', // UI theme preference
      notifications: true, // Notification toggle
      language: 'en' // Language preference
    };
  }

  updateProfileInfo({ firstName, lastName, bio, website, location }) {
    if (firstName !== undefined) this.firstName = firstName; // Update first name if provided
    if (lastName !== undefined) this.lastName = lastName; // Update last name if provided
    if (bio !== undefined) this.bio = bio; // Update bio if provided
    if (website !== undefined) this.website = website; // Update website if provided
    if (location !== undefined) this.location = location; // Update location if provided
    return this; // Return instance for chaining
  }

  updateProfilePicture(url) {
    if (typeof url !== 'string' || !url.match(/\.(jpeg|jpg|gif|png)$/)) { // Validate image URL format
      throw new Error('Invalid image URL');
    }
    this.profilePicture = url; // Set new profile picture URL
    return this; // Return instance for chaining
  }

  updatePreferences({ theme, notifications, language }) {
    if (theme && ['light', 'dark', 'system'].includes(theme)) { // Validate theme value
      this.preferences.theme = theme; // Update theme preference
    }
    if (notifications !== undefined) { // Check if notifications value exists
      this.preferences.notifications = Boolean(notifications); // Convert to boolean
    }
    if (language && ['en', 'es', 'fr', 'de'].includes(language)) { // Validate language value
      this.preferences.language = language; // Update language preference
    }
    return this; // Return instance for chaining
  }

  addSocialLink(platform, url) {
    const validPlatforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'github']; // Allowed platforms
    if (!validPlatforms.includes(platform)) { // Check platform validity
      throw new Error('Invalid social platform');
    }
    if (typeof url !== 'string' || !url.startsWith('http')) { // Validate URL format
      throw new Error('Invalid URL');
    }
    this.socialLinks[platform] = url; // Add social link to object
    return this; // Return instance for chaining
  }

  removeSocialLink(platform) {
    if (this.socialLinks[platform]) { // Check if platform exists
      delete this.socialLinks[platform]; // Remove social link
    }
    return this; // Return instance for chaining
  }

  togglePrivacy() {
    this.isPrivate = !this.isPrivate; // Flip privacy setting
    return this; // Return instance for chaining
  }

  followUser(userId) {
    if (!this.following.includes(userId)) { // Check if not already following
      this.following.push(userId); // Add to following list
    }
    return this; // Return instance for chaining
  }

  unfollowUser(userId) {
    this.following = this.following.filter(id => id !== userId); // Remove from following list
    return this; // Return instance for chaining
  }

  addFollower(userId) {
    if (!this.followers.includes(userId)) { // Check if not already a follower
      this.followers.push(userId); // Add to followers list
    }
    return this; // Return instance for chaining
  }

  removeFollower(userId) {
    this.followers = this.followers.filter(id => id !== userId); // Remove from followers list
    return this; // Return instance for chaining
  }

  getPublicProfile() {
    return { // Return public-safe profile data
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

  getFullProfile() {
    return { // Return complete profile data
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

class ProfileManager {
  constructor() {
    this.profiles = new Map(); // UserID-to-Profile map
    this.usernameIndex = new Map(); // Username-to-UserID map
    this.emailIndex = new Map(); // Email-to-UserID map
  }

  createProfile(userId, username, email, firstName, lastName) {
    if (this.profiles.has(userId)) { // Check for existing user ID
      throw new Error('User ID already exists');
    }
    if (this.usernameIndex.has(username)) { // Check for existing username
      throw new Error('Username already taken');
    }
    if (this.emailIndex.has(email)) { // Check for existing email
      throw new Error('Email already registered');
    }

    const profile = new UserProfile(userId, username, email, firstName, lastName); // Create new profile
    this.profiles.set(userId, profile); // Add to profiles map
    this.usernameIndex.set(username, userId); // Add to username index
    this.emailIndex.set(email, userId); // Add to email index
    return profile; // Return new profile
  }

  getProfileById(userId) {
    return this.profiles.get(userId); // Retrieve profile by ID
  }

  getProfileByUsername(username) {
    const userId = this.usernameIndex.get(username); // Find ID from username
    return userId ? this.profiles.get(userId) : null; // Return profile if found
  }

  getProfileByEmail(email) {
    const userId = this.emailIndex.get(email); // Find ID from email
    return userId ? this.profiles.get(userId) : null; // Return profile if found
  }

  deleteProfile(userId) {
    const profile = this.profiles.get(userId); // Get profile to delete
    if (profile) {
      this.usernameIndex.delete(profile.username); // Remove from username index
      this.emailIndex.delete(profile.email); // Remove from email index
      this.profiles.delete(userId); // Remove from profiles map
      return true; // Return success
    }
    return false; // Return failure
  }

  searchProfiles(query) {
    const results = []; // Array for search results
    const queryLower = query.toLowerCase(); // Case-insensitive query
    
    for (const [userId, profile] of this.profiles) { // Iterate all profiles
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase(); // Create full name
      if (
        profile.username.toLowerCase().includes(queryLower) || // Check username match
        fullName.includes(queryLower) // Check name match
      ) {
        results.push(profile.getPublicProfile()); // Add public profile to results
      }
    }
    
    return results; // Return matching profiles
  }

  verifyUser(userId) {
    const profile = this.profiles.get(userId); // Get user profile
    if (profile) {
      profile.isVerified = true; // Set verification flag
      return true; // Return success
    }
    return false; // Return failure
  }

  updateLastLogin(userId) {
    const profile = this.profiles.get(userId); // Get user profile
    if (profile) {
      profile.lastLogin = new Date(); // Update last login timestamp
      return true; // Return success
    }
    return false; // Return failure
  }
}

module.exports = { UserProfile, ProfileManager }; // Export both classes