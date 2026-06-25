import { AppSetting } from "../models";

export const PAY_RATE_PROMPT_KEY = "job_pay_rate_estimate_prompt";

export const DEFAULT_PAY_RATE_PROMPT = `Provide a bill rate range for a {{job_title}} in {{location}}, expressed in {{currency}}.
Required skills: {{skills}}.
Experience level required: {{experience_level}}.
Work schedule: {{work_schedule}}.

Job description:
{{job_description}}`;

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  const row = await AppSetting.findOne({ where: { key } });
  return row?.value ?? defaultValue;
}

export async function setSetting(key: string, value: string, updatedBy?: string): Promise<string> {
  const existing = await AppSetting.findOne({ where: { key } });
  if (existing) {
    await existing.update({ value, updated_by: updatedBy });
    return existing.value;
  }
  const created = await AppSetting.create({ key, value, updated_by: updatedBy });
  return created.value;
}

/** Replaces {{placeholder}} tokens in a template with the given values. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  );
}
