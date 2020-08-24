import { AbstractControl, FormBuilder } from '@angular/forms';
import { addMilliseconds, addSeconds, format } from 'date-fns';
import { EventPeriodicityRuleModel } from '../models/event-periodicity-rule.model';

export type FormType = 'create' | 'details' | 'edit' | 'delete';

export function mapPeriodicityRulesToFormControls(fb: FormBuilder, rules: EventPeriodicityRuleModel[]): AbstractControl[] {
  return rules.map((rule: EventPeriodicityRuleModel) => fb.group({
      days: fb.array([
        ...(rule.days || [])?.map((day: number) => fb.group({
          day: fb.control(day),
          include: fb.control(true)
        })),
        ...(rule.daysNot || []).map((dayNot: number) => fb.group({
          day: fb.control(dayNot),
          include: fb.control(false)
        }))
      ]),
      step: fb.control(rule.step),
      daysType: fb.control(rule.daysType)
    })
  );
}

export function formattedTime(milliseconds: number, formatExp: string) {
  const helperDate = addMilliseconds(new Date(0), milliseconds);
  return format(helperDate, formatExp);
}
