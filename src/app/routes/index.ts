import { Router } from 'express';
import AuthRoutes from '../modules/auth/auth.routes';
import CandidateRoutes from '../modules/candidate/candidate.routes';
import DepartmentRoutes from '../modules/department/department.routes';
import IndustryRoutes from '../modules/industry/industry.routes';
import ProjectRoutes from '../modules/project/project.routes';
import TrainingRoutes from '../modules/training/training.routes';
import EducationRoutes from '../modules/education/education.routes';
import LanguageRoutes from '../modules/language/language.routes';
import SocialRoutes from '../modules/social/social.routes';

const router = Router();
type TRouteModule = {
  path: string;
  route: Router;
};
const moduleRoutes: TRouteModule[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },

  {
    path: '/industry',
    route: IndustryRoutes,
  },
  {
    path: '/candidates',
    route: CandidateRoutes,
  },
  {
    path: '/department',
    route: DepartmentRoutes,
  },
  {
    path: '/project',
    route: ProjectRoutes,
  },
  {
    path: '/trainings',
    route: TrainingRoutes,
  },
  {
    path: '/education',
    route: EducationRoutes,
  },
  {
    path: '/languages',
    route: LanguageRoutes,
  },
  {
    path: '/socials',
    route: SocialRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
