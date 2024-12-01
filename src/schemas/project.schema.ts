import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class Task {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  id: number;

  @Prop({ default: 'Unassigned' })
  assignee: string;
}

@Schema()
export class Project extends Document {
  @Prop({ required: true })
  milestone: string;

  @Prop({ type: [Task], default: [] })
  tasks: Task[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
