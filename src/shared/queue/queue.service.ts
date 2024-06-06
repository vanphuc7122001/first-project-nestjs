// Inject queue name and add job or get job

import { JobOptions, Queue } from "bull";

import { BadRequestException, Injectable } from "@nestjs/common";
import { QUEUE_NAMES } from "./contants";
import { InjectQueue } from "@nestjs/bull";
import { AUTH_QUEUE_PROCESS_NAME } from "@modules/auth/constants/auth-queue-name.constant";

export const DEFAULT_OPTS: JobOptions = {
  attempts: 3, // The total number of attempts to try the job until it completes.
  removeOnComplete: false, // If true, removes the job when it successfully completes. A number specifies the amount of jobs to keep.
  // Default behavior is to keep the job in the completed set.
};

interface JobData<T> {
  queueName: string; //
  proccessName: string;
  payload: T;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.AUTH_QUEUE) private readonly _authQueue: Queue
  ) {}

  async addJob<T>(job: JobData<T>) {
    const { queueName, proccessName, payload } = job;

    switch (queueName) {
      case QUEUE_NAMES.AUTH_QUEUE: // TODO : the same queue name but different proccess name
        switch (proccessName) {
          case AUTH_QUEUE_PROCESS_NAME.SEND_FORGOT_PASSWORD_EMAIL:
            await this._authQueue.add(proccessName, {
              ...payload,
            });
            break;

          default:
            throw new BadRequestException("Process name not matches");
        }
        break;

      default:
        throw new BadRequestException(
          "Queue name not match because can not add job"
        );
    }
  }
}
