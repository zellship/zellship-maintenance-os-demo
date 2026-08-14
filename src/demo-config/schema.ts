import { z } from "zod";
import { capabilityIds, capabilityProfiles } from "./capabilities";

const roleSchema = z.enum(["admin", "operator", "supervisor"]);
const capabilitySchema = z.enum(capabilityIds);

export const demoScenarioDescriptorSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    sourceBaseline: z.string().regex(/^[0-9a-f]{40}$/),
    label: z.string().min(1),
    description: z.string().min(1),
    capabilityProfile: z.enum(["full", "execution-only"]),
    capabilities: z.array(capabilitySchema).min(1),
    branding: z.object({
      brandName: z.string().min(1),
      productName: z.string().min(1),
      tagline: z.string().min(1),
      metaDescription: z.string().min(1),
      socialDescription: z.string().min(1),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      primaryColorEnd: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      logoPath: z.string().min(1),
    }),
    context: z.object({
      defaultPlant: z.string().min(1),
      plantOptions: z.array(z.string().min(1)).min(1),
      terminals: z.array(z.string().min(1)).min(1),
      primaryOperator: z.string().min(1),
      defaultRole: roleSchema,
      enabledRoles: z.array(roleSchema).min(1),
      roleLabels: z.object({
        admin: z.string().min(1),
        operator: z.string().min(1),
        supervisor: z.string().min(1),
      }),
      loginProfiles: z
        .array(
          z.object({
            id: z.string().min(1),
            name: z.string().min(1),
            initials: z.string().min(1),
            title: z.string().min(1),
            context: z.string().min(1),
            role: roleSchema,
            color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
            colorEnd: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
          }),
        )
        .min(1),
      reportContacts: z
        .array(
          z.object({
            id: z.string().min(1),
            name: z.string().min(1),
            role: roleSchema,
            roleLabel: z.string().min(1),
            email: z.string().email().optional(),
            whatsapp: z.string().min(1).optional(),
          }),
        )
        .min(1),
      demoPin: z.string().regex(/^\d{4}$/),
    }),
    persistence: z.object({
      stateKey: z.string().min(1),
    }),
    distribution: z.object({
      classification: z.enum(["public-demo", "restricted-client-demo"]),
      containsClientIdentifiableData: z.boolean(),
    }),
  })
  .superRefine((scenario, context) => {
    const expectedCapabilities = capabilityProfiles[scenario.capabilityProfile];
    const configuredCapabilities = new Set(scenario.capabilities);
    const profileMatches =
      scenario.capabilities.length === expectedCapabilities.length &&
      configuredCapabilities.size === expectedCapabilities.length &&
      expectedCapabilities.every((capability) => configuredCapabilities.has(capability));

    if (!profileMatches) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capabilities"],
        message: `Capabilities must match profile ${scenario.capabilityProfile}`,
      });
    }

    if (!scenario.context.plantOptions.includes(scenario.context.defaultPlant)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["context", "defaultPlant"],
        message: "defaultPlant must be included in plantOptions",
      });
    }

    if (!scenario.context.enabledRoles.includes(scenario.context.defaultRole)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["context", "defaultRole"],
        message: "defaultRole must be included in enabledRoles",
      });
    }

    const unavailableProfile = scenario.context.loginProfiles.find(
      (profile) => !scenario.context.enabledRoles.includes(profile.role),
    );
    if (unavailableProfile) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["context", "loginProfiles"],
        message: `Login profile ${unavailableProfile.id} uses a disabled role`,
      });
    }

    if (
      scenario.distribution.classification === "public-demo" &&
      scenario.distribution.containsClientIdentifiableData
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["distribution", "containsClientIdentifiableData"],
        message: "Public demos cannot contain client-identifiable data",
      });
    }
  });
