import { Address, Job, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IOptions, paginationHelpers } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import { TJobFilters } from './job.types';

const createJob = async (
  payload: Job & Address & { skills: { skill: string; duration: number }[] },
  userId: string,
) => {
  const company = await prisma.company.findFirstOrThrow({
    where: {
      userId,
    },
  });

  await prisma.industry.findFirstOrThrow({
    where: {
      id: payload.industryId,
    },
  });

  await prisma.department.findFirstOrThrow({
    where: {
      id: payload.departmentId,
    },
  });
  const result = await prisma.$transaction(async transactionClient => {
    const job = await transactionClient.job.create({
      data: {
        title: payload.title,
        vacancy: payload.vacancy,
        deadline: new Date(payload.deadline),
        minSalary: payload.minSalary,
        maxSalary: payload.maxSalary,
        experienceInMonths: payload.experienceInMonths,
        jobType: payload.jobType,
        minAge: payload.minAge,
        jobDescription: payload.jobDescription,
        jobRequirements: payload.jobRequirements,
        degreeName: payload.degreeName,
        degreeTitle: payload.degreeTitle,
        compensationBenefits: payload.compensationBenefits,
        negotiable: payload.negotiable,
        industryId: payload.industryId,
        departmentId: payload.departmentId,
        companyId: company.id,
      },
    });

    if (payload.skills && payload.skills.length > 0) {
      const skills = payload.skills.map(skill => ({
        skill: skill.skill,
        duration: skill.duration,
        jobId: job.id,
      }));

      await transactionClient.skill.createMany({
        data: skills,
      });
    }

    const address = await transactionClient.address.create({
      data: {
        addressLine: payload.addressLine,
        district: payload.district,
        jobId: job.id,
      },
    });

    return { job, address };
  });

  return result;
};

const deleteJob = async (jobId: string, userId: string) => {
  const company = await prisma.company.findFirstOrThrow({
    where: {
      userId,
    },
  });
  const isJobsExists = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
  });
  if (!isJobsExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Job not found');
  }
  const result = await prisma.$transaction(async transactionClient => {
    await transactionClient.skill.deleteMany({
      where: { jobId },
    });

    await transactionClient.address.delete({
      where: { jobId },
    });
    const job = await transactionClient.job.delete({
      where: {
        id: jobId,
        companyId: company.id,
      },
    });

    return job;
  });

  return result;
};

const getSingleJob = async (jobId: string) => {
  const result = await prisma.job.findUniqueOrThrow({
    where: {
      id: jobId,
    },
  });
  return result;
};

const getAllJobs = async (filters: TJobFilters, options: IOptions) => {
  const query = filters.query;
  const location = filters.location;
  const industry = filters.industry;
  const department = filters.department;
  const minExperience = Number(filters.minExperience);
  const minSalary = Number(filters.minSalary);
  const maxSalary = Number(filters.maxSalary);
  const negotiable = filters.negotiable && filters.negotiable.toLowerCase();

  const { limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const whereOptions: Prisma.JobWhereInput = {};

  if (negotiable) {
    whereOptions.negotiable = negotiable === 'true';
  }

  if (query) {
    whereOptions.OR = [
      {
        title: {
          contains: String(query),
          mode: 'insensitive',
        },
      },
      {
        company: {
          companyName: {
            contains: String(query),
            mode: 'insensitive',
          },
        },
      },
    ];
  }

  if (location) {
    whereOptions.address = {
      OR: [
        {
          addressLine: { contains: String(location), mode: 'insensitive' },
        },
        {
          district: { contains: String(location), mode: 'insensitive' },
        },
      ],
    };
  }

  if (industry) {
    whereOptions.industry = {
      name: {
        contains: String(industry),
        mode: 'insensitive',
      },
    };
  }

  if (department) {
    whereOptions.department = {
      name: {
        contains: String(department),
        mode: 'insensitive',
      },
    };
  }

  if (minExperience) {
    whereOptions.experienceInMonths = {
      gte: minExperience,
    };
  }

  if (minSalary) {
    whereOptions.minSalary = {
      gte: minSalary,
    };
  }

  if (maxSalary) {
    whereOptions.maxSalary = {
      lte: maxSalary,
    };
  }

  const jobs = await prisma.job.findMany({
    where: whereOptions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      department: true,
      industry: true,
    },
  });

  return jobs;
};
const JobsServices = {
  createJob,
  deleteJob,
  getSingleJob,
  getAllJobs,
};
export default JobsServices;