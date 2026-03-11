'use client'
import { useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import { Job } from "@/types/jobs";

interface Props {
  job: Job;
}

const JobDetailSEO = ({ job }: Props) => {
  const title = `${job.title} — ${job.company_name}`;
  const desc = `${job.company_name} söker ${job.title} i ${job.location}. ${job.description.slice(0, 100)}…`;

  const jsonLd = useMemo(() => {
    const posting: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: job.full_description || job.description,
      datePosted: job.created_at,
      validThrough: new Date(new Date(job.created_at).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: job.company_name,
        ...(job.company_logo_url ? { logo: job.company_logo_url } : {}),
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location,
          addressCountry: "SE",
        },
      },
    };

    if (job.work_model === "remote") {
      posting.jobLocationType = "TELECOMMUTE";
    }

    if (job.salary_min && job.salary_max) {
      posting.baseSalary = {
        "@type": "MonetaryAmount",
        currency: "SEK",
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salary_min,
          maxValue: job.salary_max,
          unitText: "MONTH",
        },
      };
    }

    return posting;
  }, [job]);

  return (
    <SEOHead
      title={title}
      description={desc}
      canonical={`/jobb/${job.slug}`}
      ogType="article"
      jsonLd={jsonLd}
    />
  );
};

export default JobDetailSEO;
