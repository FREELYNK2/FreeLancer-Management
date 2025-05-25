class MilestoneTracker {
  constructor() {
    this.projects = new Map();       
    this.freelancers = new Map();    
    this.nextProjectId = 1000;
    this.nextMilestoneId = 2000;
  }

  
  registerFreelancer(freelancerId, name, skills = []) {
    if (this.freelancers.has(freelancerId)) {
      throw new Error('Freelancer already registered');
    }

    this.freelancers.set(freelancerId, {     /// Create new freelancer record
      name,
      skills,
      completedProjects: 0,
      activeProjects: 0,
      milestonesCompleted: 0,
      rating: 0,
      joinedDate: new Date(),
      lastActive: new Date()
    });

    return this.getFreelancer(freelancerId);
  }

  
  createProject(clientId, title, description, budget, deadline) {
    const projectId = `proj_${this.nextProjectId++}`;
    
    this.projects.set(projectId, {
      id: projectId,
      clientId,
      title,
      description,
      budget,
      deadline: new Date(deadline),
      createdDate: new Date(),
      status: 'pending', 
      milestones: [],
      assignedFreelancer: null,
      progress: 0
    });

    return projectId;
  }

  
  assignFreelancer(projectId, freelancerId) {
    const project = this.getProject(projectId);
    const freelancer = this.getFreelancer(freelancerId);

    if (project.assignedFreelancer) {
      throw new Error('Project already has an assigned freelancer');
    }

    project.assignedFreelancer = freelancerId;
    project.status = 'active';
    
    freelancer.activeProjects += 1;
    freelancer.lastActive = new Date();

    return true;
  }

  
  addMilestone(projectId, title, description, dueDate, completionCriteria) {
    const project = this.getProject(projectId);
    const milestoneId = `mile_${this.nextMilestoneId++}`;

    const milestone = {
      id: milestoneId,
      title,
      description,
      dueDate: new Date(dueDate),
      completionCriteria,
      status: 'pending', 
      progress: 0,
      startedDate: null,
      completedDate: null,
      tasks: []
    };

    project.milestones.push(milestone);
    return milestoneId;
  }

  
  addTaskToMilestone(projectId, milestoneId, taskName, taskDescription) {
    const milestone = this.getMilestone(projectId, milestoneId);
    
    milestone.tasks.push({
      id: `task_${milestone.tasks.length + 1}`,
      name: taskName,
      description: taskDescription,
      status: 'pending',
      assignedDate: new Date(),
      completedDate: null
    });

    return milestone.tasks.length;
  }

  
  updateTaskStatus(projectId, milestoneId, taskId, status) {
    const task = this.getTask(projectId, milestoneId, taskId);
    
    const validStatuses = ['pending', 'in-progress', 'completed', 'blocked'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid task status');
    }

    task.status = status;
    
    if (status === 'completed') {
      task.completedDate = new Date();
    }

    
    this.updateMilestoneProgress(projectId, milestoneId);
    
    return true;
  }

  
  updateMilestoneProgress(projectId, milestoneId) {
    const milestone = this.getMilestone(projectId, milestoneId);
    const project = this.getProject(projectId);
    
    if (milestone.tasks.length === 0) return 0;

    const completedTasks = milestone.tasks.filter(t => t.status === 'completed').length;
    milestone.progress = Math.round((completedTasks / milestone.tasks.length) * 100);
    
    if (milestone.progress === 100) {
      milestone.status = 'completed';
      milestone.completedDate = new Date();
      
      const freelancer = this.getFreelancer(project.assignedFreelancer);
      freelancer.milestonesCompleted += 1;
    }

    
    this.updateProjectProgress(projectId);
    
    return milestone.progress;
  }

  
  updateProjectProgress(projectId) {
    const project = this.getProject(projectId);
    
    if (project.milestones.length === 0) return 0;

    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    project.progress = Math.round((completedMilestones / project.milestones.length) * 100);
    
    if (project.progress === 100) {
      project.status = 'completed';
      
      const freelancer = this.getFreelancer(project.assignedFreelancer);
      freelancer.activeProjects -= 1;
      freelancer.completedProjects += 1;
      freelancer.lastActive = new Date();
    }

    return project.progress;
  }

  
  getProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    return project;
  }

  
  getFreelancer(freelancerId) {
    const freelancer = this.freelancers.get(freelancerId);
    if (!freelancer) throw new Error('Freelancer not found');
    return freelancer;
  }

  
  getMilestone(projectId, milestoneId) {
    const project = this.getProject(projectId);
    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');
    return milestone;
  }

  
  getTask(projectId, milestoneId, taskId) {
    const milestone = this.getMilestone(projectId, milestoneId);
    const task = milestone.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    return task;
  }

  
  getFreelancerProjects(freelancerId) {
    const projects = [];
    for (const [projectId, project] of this.projects) {
      if (project.assignedFreelancer === freelancerId) {
        projects.push({
          id: projectId,
          title: project.title,
          status: project.status,
          progress: project.progress,
          deadline: project.deadline
        });
      }
    }
    return projects;
  }

  
  getProjectMilestones(projectId) {
    const project = this.getProject(projectId);
    return project.milestones.map(m => ({
      id: m.id,
      title: m.title,
      status: m.status,
      progress: m.progress,
      dueDate: m.dueDate
    }));
  }

  
  getMilestoneTasks(projectId, milestoneId) {
    const milestone = this.getMilestone(projectId, milestoneId);
    return milestone.tasks;
  }

  
  updateFreelancerRating(freelancerId, newRating) {
    const freelancer = this.getFreelancer(freelancerId);
    
    if (newRating < 1 || newRating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    
    freelancer.rating = freelancer.rating === 0 ? 
      newRating : 
      Math.round(((freelancer.rating + newRating) / 2) * 10) / 10;
    
    return freelancer.rating;
  }

  
  getPlatformStats() {
    let totalProjects = 0;
    let completedProjects = 0;
    let activeFreelancers = 0;
    let totalMilestones = 0;
    let completedMilestones = 0;

    this.projects.forEach(project => {    // Count projects
      totalProjects++;
      if (project.status === 'completed') completedProjects++;
    });

    this.freelancers.forEach(freelancer => {           // Count freelancer metrics
      if (freelancer.activeProjects > 0) activeFreelancers++;
      totalMilestones += freelancer.milestonesCompleted;
      completedMilestones += freelancer.milestonesCompleted;
    });

    return {      // Return compiled statistics
      totalProjects,
      completedProjects,
      activeFreelancers,
      totalFreelancers: this.freelancers.size,
      totalMilestones,
      completedMilestones,
      completionRate: totalProjects > 0 ? 
        Math.round((completedProjects / totalProjects) * 100) : 0
    };
  }
}

module.exports = MilestoneTracker;