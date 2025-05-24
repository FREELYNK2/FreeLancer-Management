const { UserProfile, ProfileManager } = require('../pages/Profile.js');
const assert = require('assert');

describe('UserProfile', () => {
  let profile;

  beforeEach(() => {
    profile = new UserProfile('123', 'testuser', 'test@example.com', 'Test', 'User');
  });

  it('should create a profile with basic information', () => {
    assert.strictEqual(profile.userId, '123');
    assert.strictEqual(profile.username, 'testuser');
    assert.strictEqual(profile.email, 'test@example.com');
    assert.strictEqual(profile.firstName, 'Test');
    assert.strictEqual(profile.lastName, 'User');
    assert.strictEqual(profile.isVerified, false);
  });

  it('should update profile information', () => {
    profile.updateProfileInfo({
      firstName: 'New',
      lastName: 'Name',
      bio: 'Hello world',
      website: 'https://example.com',
      location: 'Earth'
    });
    
    assert.strictEqual(profile.firstName, 'New');
    assert.strictEqual(profile.lastName, 'Name');
    assert.strictEqual(profile.bio, 'Hello world');
    assert.strictEqual(profile.website, 'https://example.com');
    assert.strictEqual(profile.location, 'Earth');
  });

  it('should update profile picture with valid URL', () => {
    profile.updateProfilePicture('https://example.com/image.png');
    assert.strictEqual(profile.profilePicture, 'https://example.com/image.png');
  });

  it('should throw error when updating profile picture with invalid URL', () => {
    assert.throws(() => profile.updateProfilePicture('invalid-url'), Error);
  });

  it('should update preferences', () => {
    profile.updatePreferences({
      theme: 'dark',
      notifications: false,
      language: 'es'
    });
    
    assert.strictEqual(profile.preferences.theme, 'dark');
    assert.strictEqual(profile.preferences.notifications, false);
    assert.strictEqual(profile.preferences.language, 'es');
  });

  it('should not update preferences with invalid values', () => {
    profile.updatePreferences({
      theme: 'invalid',
      language: 'invalid'
    });
    
    // Should remain default values
    assert.strictEqual(profile.preferences.theme, 'light');
    assert.strictEqual(profile.preferences.language, 'en');
  });

  it('should add and remove social links', () => {
    profile.addSocialLink('twitter', 'https://twitter.com/test');
    assert.strictEqual(profile.socialLinks.twitter, 'https://twitter.com/test');
    
    profile.removeSocialLink('twitter');
    assert.strictEqual(profile.socialLinks.twitter, undefined);
  });

  it('should throw error when adding invalid social link', () => {
    assert.throws(() => profile.addSocialLink('invalid', 'https://example.com'), Error);
    assert.throws(() => profile.addSocialLink('twitter', 'invalid-url'), Error);
  });

  it('should toggle account privacy', () => {
    assert.strictEqual(profile.isPrivate, false);
    profile.togglePrivacy();
    assert.strictEqual(profile.isPrivate, true);
    profile.togglePrivacy();
    assert.strictEqual(profile.isPrivate, false);
  });

  it('should manage followers and following', () => {
    profile.followUser('user2');
    profile.addFollower('user3');
    
    assert.deepStrictEqual(profile.following, ['user2']);
    assert.deepStrictEqual(profile.followers, ['user3']);
    
    profile.unfollowUser('user2');
    profile.removeFollower('user3');
    
    assert.deepStrictEqual(profile.following, []);
    assert.deepStrictEqual(profile.followers, []);
  });

  it('should return different profile views', () => {
    const publicProfile = profile.getPublicProfile();
    assert.strictEqual(publicProfile.email, undefined);
    assert.strictEqual(publicProfile.userId, undefined);
    
    const fullProfile = profile.getFullProfile();
    assert.strictEqual(fullProfile.email, 'test@example.com');
    assert.strictEqual(fullProfile.userId, '123');
  });
});

describe('ProfileManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ProfileManager();
    manager.createProfile('1', 'user1', 'user1@example.com', 'User', 'One');
    manager.createProfile('2', 'user2', 'user2@example.com', 'User', 'Two');
  });

  it('should create and retrieve profiles', () => {
    assert.strictEqual(manager.getProfileById('1').username, 'user1');
    assert.strictEqual(manager.getProfileByUsername('user2').userId, '2');
    assert.strictEqual(manager.getProfileByEmail('user1@example.com').userId, '1');
  });

  it('should prevent duplicate IDs, usernames, or emails', () => {
    assert.throws(() => manager.createProfile('1', 'newuser', 'new@example.com', 'New', 'User'), Error);
    assert.throws(() => manager.createProfile('3', 'user1', 'new@example.com', 'New', 'User'), Error);
    assert.throws(() => manager.createProfile('3', 'newuser', 'user1@example.com', 'New', 'User'), Error);
  });

  it('should delete profiles', () => {
    assert.strictEqual(manager.deleteProfile('1'), true);
    assert.strictEqual(manager.getProfileById('1'), undefined);
    assert.strictEqual(manager.getProfileByUsername('user1'), null);
    assert.strictEqual(manager.getProfileByEmail('user1@example.com'), null);
    assert.strictEqual(manager.deleteProfile('999'), false);
  });

  it('should search profiles', () => {
    const results = manager.searchProfiles('user');
    assert.strictEqual(results.length, 2);
    
    const user1Results = manager.searchProfiles('one');
    assert.strictEqual(user1Results.length, 1);
    assert.strictEqual(user1Results[0].username, 'user1');
  });

  it('should verify users and update last login', () => {
    const profile = manager.getProfileById('1');
    assert.strictEqual(profile.isVerified, false);
    
    manager.verifyUser('1');
    assert.strictEqual(profile.isVerified, true);
    
    const oldLogin = profile.lastLogin;
    manager.updateLastLogin('1');
    assert.notStrictEqual(profile.lastLogin, oldLogin);
  });
});