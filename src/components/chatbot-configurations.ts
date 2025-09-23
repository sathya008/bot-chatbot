import React from "react";

export interface FlowOption {
  text: string;
  nextState: string;
  botResponse: string | React.ReactNode;
  service?: string;
  action?: 'OPEN_LINK';
  link?: string;
}

interface OptionsFlowStep {
  type: 'options';
  options: FlowOption[];
}

interface InputFlowStep {
  type: 'input';
  inputType: 'phone' | 'email' | 'text';
  botResponse: string;
  nextState: string;
  submitOnCompletion?: boolean;
  validationMessage?: string;
}

type FlowStep = OptionsFlowStep | InputFlowStep;

export interface ClientConfiguration {
  brandName: string;
  apiUrl?: string;
  flow: Record<string, FlowStep | { type: 'end' }>;
  apiType: 'LEAD_GENERATE' | 'PRODUCT_REQUEST';
}

export const clientConfigurations: Record<string, ClientConfiguration> = {
  thebotagency: {
    brandName: 'The Bot Agency',
    apiType: 'LEAD_GENERATE',
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    flow: {
      INITIAL: {
        type: 'options',
        options: [
          { text: '📊 Market Survey', service: 'Marketing Strategies', nextState: 'COLLECT_PHONE', botResponse: "Perfect! Could you share your phone number so our team can call or WhatsApp you with info?" },
          { text: '🎯 Branding', service: 'Branding', nextState: 'COLLECT_PHONE', botResponse: "Perfect! Could you share your phone number so our team can call or WhatsApp you with info?" },
          { text: '🔍 SEO', service: 'Seo', nextState: 'ASK_SEO_TYPE', botResponse: "Great! Is this for a new website or an existing one?" },
          { text: '💻 Website Development', service: 'Web Development', nextState: 'ASK_WEBSITE_TYPE', botResponse: "Great choice! What kind of website are you looking for?" },
          { text: '📱 App Development', service: 'Tech Development', nextState: 'COLLECT_PHONE', botResponse: "Perfect! Could you share your phone number so our team can call or WhatsApp you with info?" },
        ],
      },
      ASK_WEBSITE_TYPE: {
        type: 'options',
        options: [
          { text: 'Business', nextState: 'COLLECT_PHONE', botResponse: "Got it. Could you share your phone number so we can reach out?" },
          { text: 'E-Commerce', nextState: 'COLLECT_PHONE', botResponse: "Got it. Could you share your phone number so we can reach out?" },
          { text: 'Personal', nextState: 'COLLECT_PHONE', botResponse: "Got it. Could you share your phone number so we can reach out?" },
          { text: 'Other', nextState: 'COLLECT_PHONE', botResponse: "Got it. Could you share your phone number so we can reach out?" },
        ],
      },
      ASK_SEO_TYPE: {
        type: 'options',
        options: [
          { text: 'New Website', nextState: 'COLLECT_PHONE', botResponse: "Got it. Could you share your phone number so we can reach out?" },
          { text: 'Existing Website', nextState: 'COLLECT_PHONE', botResponse: "Got it. Could you share your phone number so we can reach out?" },
        ],
      },
      COLLECT_PHONE: {
        type: 'input',
        inputType: 'phone',
        botResponse: "Thanks! And your best email so we can send the proposal?",
        nextState: 'COLLECT_EMAIL',
      },
      COLLECT_EMAIL: {
        type: 'input',
        inputType: 'email',
        botResponse: "Got it ✅ Our team will reach out shortly. Just two quick optional questions to help us prepare.\n\nWhen are you planning to start?",
        nextState: 'ASK_TIMELINE',
        submitOnCompletion: true,
      },
      ASK_TIMELINE: {
        type: 'options',
        options: [
          { text: 'Immediately', nextState: 'ASK_BUDGET', botResponse: "And do you have a budget range in mind?" },
          { text: '1–3 Months', nextState: 'ASK_BUDGET', botResponse: "And do you have a budget range in mind?" },
          { text: 'Later', nextState: 'ASK_BUDGET', botResponse: "And do you have a budget range in mind?" },
        ],
      },
      ASK_BUDGET: {
        type: 'options',
        options: [
          { text: 'Under ₹50k', nextState: 'FINAL_CTA', botResponse: "Thanks! I’ll send your info to our team. They’ll contact you shortly.\n\nWant to schedule a free consultation now?" },
          { text: '₹50k–₹2L', nextState: 'FINAL_CTA', botResponse: "Thanks! I’ll send your info to our team. They’ll contact you shortly.\n\nWant to schedule a free consultation now?" },
          { text: 'Above ₹2L', nextState: 'FINAL_CTA', botResponse: "Thanks! I’ll send your info to our team. They’ll contact you shortly.\n\nWant to schedule a free consultation now?" },
        ],
      },
      FINAL_CTA: {
        type: 'options',
        options: [
          { text: '📅 Book Call', action: 'OPEN_LINK', link: 'https://calendly.com/harry-thebot/consultation-with-thebot', botResponse: "Great! I've opened our booking page for you.", nextState: 'END' },
          { text: '📄 View Portfolio', action: 'OPEN_LINK', link: 'https://app-development-test.vercel.app', botResponse: "Great! I've opened our website page for you.", nextState: 'END' },
          { text: '❌ Not Now', nextState: 'END', botResponse: "No problem! We'll be in touch soon. Have a great day!" },
        ],
      },
      END: { type: 'end' },
    },
  },

  globalsolutions: {
    brandName: 'Global Softwares',
    apiType: 'PRODUCT_REQUEST',
    apiUrl: process.env.NEXT_PUBLIC_GLOBAL_SOFT_URL,
    flow: {
      INITIAL: {
        type: 'options',
        options: [
          { text: 'FibrePro (Order Management)', service: 'FibrePro', nextState: 'ASK_FACTORY_GS', botResponse: "Great! Is this for your factory?" },
          { text: 'G~Pay (HR & Payroll)', service: 'G-Pay', nextState: 'ASK_FACTORY_GS', botResponse: "Great! Is this for your factory?" },
          { text: 'Cammando (Production Planning)', service: 'Cammando', nextState: 'ASK_FACTORY_GS', botResponse: "Great! Is this for your factory?" },
        ],
      },
      ASK_FACTORY_GS: {
        type: 'options',
        options: [
          { text: 'Yes', nextState: 'COLLECT_COMPANY_GS', botResponse: "Got it. Could you share your company name?" },
          { text: 'No', nextState: 'COLLECT_COMPANY_GS', botResponse: "Got it. Could you share your company name?" },
        ]
      },
      COLLECT_COMPANY_GS: {
        type: 'input',
        inputType: 'text',
        botResponse: "Got it. Could you share your email so we can reach you out?",
        nextState: 'COLLECT_EMAIL_GS',
      },
      COLLECT_EMAIL_GS: {
        type: 'input',
        inputType: 'email',
        botResponse: "We received your details. Our team will reach out to you.",
        nextState: 'END',
        submitOnCompletion: true,
      },
      END: { type: 'end' },
    }
  },

  ojk: {
    brandName:'OJK Job Portal',
    apiType: 'LEAD_GENERATE',
    apiUrl: process.env.NEXT_PUBLIC_OJK_URL,
    flow: {
      INITIAL: {
        type: 'options',
        options: [
          { text: '👨‍💼 I am a Job Seeker', nextState: 'ASK_JOB_TYPE', botResponse: "Awesome! What type of job are you looking for?" },
          { text: '🏢 I am a Company', nextState: 'ASK_COMPANY_NAME', botResponse: "Great! Could you please share your company name?" },
        ],
      },
      ASK_JOB_TYPE: {
        type: 'options',
        options: [
          { text: 'IT / Software', nextState: 'ASK_SKILLS', botResponse: "Nice! Can you list a few of your key skills?" },
          { text: 'Marketing / Sales', nextState: 'ASK_SKILLS', botResponse: "Nice! Can you list a few of your key skills?" },
          { text: 'Other', nextState: 'ASK_SKILLS', botResponse: "Great! Can you share your top skills?" },
        ],
      },
      ASK_SKILLS: {
        type: 'input',
        inputType: 'text',
        botResponse: "Thanks! And could you share your email so we can send you matching job opportunities?",
        nextState: 'COLLECT_EMAIL_JOBSEEKER',
      },
      COLLECT_EMAIL_JOBSEEKER: {
        type: 'input',
        inputType: 'email',
        botResponse: "Perfect ✅ We’ll send you job alerts soon. Thanks for registering!",
        nextState: 'END',
        submitOnCompletion: true,
      },
      ASK_COMPANY_NAME: {
        type: 'input',
        inputType: 'text',
        botResponse: "Got it. Could you share your work email so our team can contact you?",
        nextState: 'COLLECT_EMAIL_COMPANY',
      },
      COLLECT_EMAIL_COMPANY: {
        type: 'input',
        inputType: 'email',
        botResponse: "Perfect ✅ Our sales team will reach out with pricing and demo details.",
        nextState: 'END',
        submitOnCompletion: true,
      },
      END: { type: 'end' },
    },
  },
};
