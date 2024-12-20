import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import JobControllers from './jobs.controllers';
import JobValidations from './jobs.validation-schemas';
const router = express.Router();

router.post(
  '/create-job',
  auth(Role.EMPLOYER),
  validateRequest(JobValidations.createJobValidationSchema),
  JobControllers.createJob,
);
router.delete('/:jobId', auth(Role.EMPLOYER), JobControllers.deleteJob);
router.get('/me/all', auth(Role.EMPLOYER), JobControllers.getAllMyPostedJobs);
router.get('/get-single/:jobId', JobControllers.getSingleJob);
router.get('/get-all', JobControllers.getAllJobs);
router.get('/count', JobControllers.getJobsCount);

const JobsRoutes = router;

export default JobsRoutes;
