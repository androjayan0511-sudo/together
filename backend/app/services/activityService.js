import { activityRepository } from '../repositories/activityRepository.js';

export const activityService = {
  async getActivities() {
    return activityRepository.findAll();
  },

  async getActivityById(id) {
    return activityRepository.findById(id);
  },

  async getActivitiesByCategory(category) {
    return activityRepository.findByCategory(category);
  }
};
