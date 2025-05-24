const MilestoneTracker = require('../pages/milestone.js');
const assert = require('assert');

describe('MilestoneTracker', () => {
  let tracker;
  let freelancerId = 'freelancer1';
  let clientId = 'client1';
  let projectId;
  let milestoneId;

  beforeEach(() => {
    tracker = new MilestoneTracker();
    tracker.registerFreelancer(freelancerId, 'John Doe', ['web development', 'design']);
    projectId = tracker.createProject(
      clientId, 
      'Website Redesign', 
      'Redesign company website', 
      5000, 
      '2023-12-31'
    );
    tracker.assignFreelancer(projectId, freelancerId);
    milestoneId = tracker.addMilestone(
      projectId,
      'Design Phase',
      'Complete all design work',
      '2023-10-15',
      'All design tasks completed'
    );
  });

  afterEach(() => {
    tracker = null;
  });

  describe('Freelancer Registration', () => {
    it('should register new freelancers', () => {
      const freelancer = tracker.getFreelancer(freelancerId);
      assert.strictEqual(freelancer.name, 'John Doe');
      assert.deepStrictEqual(freelancer.skills, ['web development', 'design']);
      assert.strictEqual(freelancer.activeProjects, 1);
    });

    it('should prevent duplicate freelancer registration', () => {
      assert.throws(() => tracker.registerFreelancer(freelancerId, 'Duplicate'), Error);
    });
  });

  describe('Project Management', () => {
    it('should create projects', () => {
      const project = tracker.getProject(projectId);
      assert.strictEqual(project.title, 'Website Redesign');
      assert.strictEqual(project.status, 'active');
      assert.strictEqual(project.assignedFreelancer, freelancerId);
    });

    it('should assign freelancers to projects', () => {
      const newProjectId = tracker.createProject(clientId, 'New Project', 'Test', 1000, '2023-12-31');
      tracker.assignFreelancer(newProjectId, freelancerId);
      
      const project = tracker.getProject(newProjectId);
      assert.strictEqual(project.assignedFreelancer, freelancerId);
      
      const freelancer = tracker.getFreelancer(freelancerId);
      assert.strictEqual(freelancer.activeProjects, 2);
    });
  });

  describe('Milestone Tracking', () => {
    it('should add milestones to projects', () => {
      const milestones = tracker.getProjectMilestones(projectId);
      assert.strictEqual(milestones.length, 1);
      assert.strictEqual(milestones[0].title, 'Design Phase');
    });

    it('should update milestone progress', () => {
      const taskId = tracker.addTaskToMilestone(
        projectId, 
        milestoneId, 
        'Create wireframes', 
        'Design wireframes for all pages'
      );
      
      tracker.updateTaskStatus(projectId, milestoneId, 'task_1', 'completed');
      
      const milestone = tracker.getMilestone(projectId, milestoneId);
      assert.strictEqual(milestone.progress, 100);
      assert.strictEqual(milestone.status, 'completed');
      
      const project = tracker.getProject(projectId);
      assert.strictEqual(project.progress, 100);
      assert.strictEqual(project.status, 'completed');
      
      const freelancer = tracker.getFreelancer(freelancerId);
      assert.strictEqual(freelancer.milestonesCompleted, 1);
      assert.strictEqual(freelancer.activeProjects, 0);
      assert.strictEqual(freelancer.completedProjects, 1);
    });
  });

  describe('Task Management', () => {
    it('should add tasks to milestones', () => {
      const taskCount = tracker.addTaskToMilestone(
        projectId, 
        milestoneId, 
        'Create wireframes', 
        'Design wireframes for all pages'
      );
      assert.strictEqual(taskCount, 1);
      
      const tasks = tracker.getMilestoneTasks(projectId, milestoneId);
      assert.strictEqual(tasks.length, 1);
      assert.strictEqual(tasks[0].name, 'Create wireframes');
    });

    it('should update task status', () => {
      tracker.addTaskToMilestone(projectId, milestoneId, 'Task 1', 'Description');
      
      tracker.updateTaskStatus(projectId, milestoneId, 'task_1', 'in-progress');
      let task = tracker.getTask(projectId, milestoneId, 'task_1');
      assert.strictEqual(task.status, 'in-progress');
      
      tracker.updateTaskStatus(projectId, milestoneId, 'task_1', 'completed');
      task = tracker.getTask(projectId, milestoneId, 'task_1');
      assert.strictEqual(task.status, 'completed');
      assert(task.completedDate instanceof Date);
    });
  });

  describe('Progress Tracking', () => {
    it.skip('should track project progress', () => {
      
      const secondMilestoneId = tracker.addMilestone(
        projectId,
        'Development Phase',
        'Complete all development work',
        '2023-11-30',
        'All development tasks completed'
      );
      
      
      tracker.addTaskToMilestone(projectId, milestoneId, 'Task 1', 'Desc');
      tracker.addTaskToMilestone(projectId, milestoneId, 'Task 2', 'Desc');
      
      
      tracker.updateTaskStatus(projectId, milestoneId, 'task_1', 'completed');
      
      
      const milestone = tracker.getMilestone(projectId, milestoneId);
      assert.strictEqual(milestone.progress, 50);
      
      const project = tracker.getProject(projectId);
      assert.strictEqual(project.progress, 25); 
    });
  });

  describe('Freelancer Rating', () => {
    it('should update freelancer rating', () => {
      tracker.updateFreelancerRating(freelancerId, 4);
      let freelancer = tracker.getFreelancer(freelancerId);
      assert.strictEqual(freelancer.rating, 4);
      
      tracker.updateFreelancerRating(freelancerId, 5);
      freelancer = tracker.getFreelancer(freelancerId);
      assert.strictEqual(freelancer.rating, 4.5);
    });

    it('should reject invalid ratings', () => {
      assert.throws(() => tracker.updateFreelancerRating(freelancerId, 0), Error);
      assert.throws(() => tracker.updateFreelancerRating(freelancerId, 6), Error);
    });
  });

  describe('Platform Statistics', () => {
    it.skip('should provide platform stats', () => {
      // Create another project
      const project2 = tracker.createProject(clientId, 'Project 2', 'Desc', 2000, '2023-12-31');
      tracker.assignFreelancer(project2, freelancerId);
      
      
      const milestone2 = tracker.addMilestone(project2, 'Milestone', 'Desc', '2023-11-30', 'Done');
      tracker.addTaskToMilestone(project2, milestone2, 'Task', 'Desc');
      tracker.updateTaskStatus(project2, milestone2, 'task_1', 'completed');
      
      const stats = tracker.getPlatformStats();
      assert.strictEqual(stats.totalProjects, 2);
      assert.strictEqual(stats.completedProjects, 1);
      assert.strictEqual(stats.activeFreelancers, 1);
      assert.strictEqual(stats.totalFreelancers, 1);
      assert.strictEqual(stats.totalMilestones, 2);
      assert.strictEqual(stats.completedMilestones, 1);
      assert.strictEqual(stats.completionRate, 50);
    });
  });
});