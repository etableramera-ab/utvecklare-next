'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Star, TrendingUp, Eye, Users, ArrowRight, Loader2, Plus } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CompanyJobManager from "@/components/jobs/CompanyJobManager";
import ContinueReading from "@/components/dashboard/ContinueReading";
import BookmarkedArticles from "@/components/dashboard/BookmarkedArticles";
import SubscriptionManager from "@/components/SubscriptionManager";
import { useCompanyPlan } from "@/hooks/useCompanyPlan";
import DashboardEvents from "@/components/dashboard/DashboardEvents";

interface JobRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  work_model: string;
  salary_min: number | null;
  salary_max: number | null;
  tech_tags: string[] | null;
  is_featured: boolean;
  companies: { name: string } | null;
}

const DashboardPage = () => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState<JobRow[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobRow[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/logga-in");
      return;
    }
    if (user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    const [profileRes, companyRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase.from("companies").select("*").eq("user_id", user!.id).maybeSingle(),
    ]);
    setProfile(profileRes.data);
    setCompany(companyRes.data);

    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, slug, title, location, work_model, salary_min, salary_max, tech_tags, is_featured, companies(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);

    const allJobs = (jobs ?? []) as unknown as JobRow[];
    const tags = (profileRes.data?.tech_stack ?? []).map((t: string) => t.toLowerCase());
    
    if (tags.length > 0) {
      const matched = allJobs.filter(j =>
        (j.tech_tags ?? []).some(t => tags.includes(t.toLowerCase()))
      );
      setRecommendedJobs(matched.length > 0 ? matched.slice(0, 4) : allJobs.slice(0, 4));
    } else {
      setRecommendedJobs(allJobs.slice(0, 4));
    }

    const { data: savedData } = await supabase
      .from("saved_jobs")
      .select("job_id, jobs(id, slug, title, location, work_model, salary_min, salary_max, tech_tags, is_featured, companies(name))")
      .eq("user_id", user!.id)
      .limit(10);

    setSavedJobs(
      (savedData ?? [])
        .map((s: any) => s.jobs as JobRow)
        .filter(Boolean)
    );

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCompany = !!company;
  const { subscription, isTrialing, trialEnd } = useCompanyPlan();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Dashboard" description="Din personliga dashboard på utvecklare.ai" canonical="/dashboard" noindex />
      <Navbar />
      <section className="pt-16">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Hej, {profile?.full_name || user?.email?.split("@")[0]} 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {isCompany ? `${company.name} — ${company.plan}-plan` : "Din personliga dashboard"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-border" onClick={() => router.push("/profil")}>
                Min profil
              </Button>
              <Button variant="ghost" className="text-muted-foreground" onClick={handleSignOut}>
                Logga ut
              </Button>
            </div>
          </div>

          {isCompany ? (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Briefcase, label: "Publicerade jobb", value: "0", color: "text-primary" },
                  { icon: Eye, label: "Visningar (30d)", value: "0", color: "text-secondary" },
                  { icon: Users, label: "Ansökningar", value: "0", color: "text-emerald-400" },
                  { icon: TrendingUp, label: "Klick till ansökan", value: "0%", color: "text-amber-400" },
                ].map((stat) => (
                  <Card key={stat.label} className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <div>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <SubscriptionManager
                company={company}
                subscription={subscription}
                isTrialing={isTrialing}
                trialEnd={trialEnd}
              />

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Dina jobbannonser</CardTitle>
                  <Button className="gradient-bg text-primary-foreground" size="sm" asChild>
                    <Link href="/dashboard/publicera-jobb"><Plus className="w-4 h-4 mr-1" /> Publicera jobb</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <CompanyJobManager companyId={company.id} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Tabs defaultValue="jobs" className="space-y-6">
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="jobs">Rekommenderade jobb</TabsTrigger>
                <TabsTrigger value="saved">Sparade jobb</TabsTrigger>
                <TabsTrigger value="articles">Artiklar</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs">
                {recommendedJobs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {recommendedJobs.map((job) => (
                      <Link key={job.id} href={`/jobb/${job.slug}`}>
                        <Card className="bg-card border-border card-hover h-full">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-foreground">{job.title}</h3>
                                <p className="text-sm text-muted-foreground">{job.companies?.name} · {job.location}</p>
                              </div>
                              {job.is_featured && <Badge className="gradient-bg text-primary-foreground text-[10px]">Featured</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {(job.tech_tags ?? []).slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{job.work_model}</span>
                              {job.salary_min && job.salary_max && (
                                <span>{(job.salary_min / 1000).toFixed(0)}k–{(job.salary_max / 1000).toFixed(0)}k SEK</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="text-center py-12 text-muted-foreground">
                      <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p>Inga rekommenderade jobb just nu.</p>
                      <Button variant="outline" className="border-border mt-4" onClick={() => router.push("/jobb")}>
                        Utforska jobb
                      </Button>
                    </CardContent>
                  </Card>
                )}
                <div className="text-center mt-6">
                  <Button variant="outline" className="border-border" onClick={() => router.push("/jobb")}>
                    Se alla jobb <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="saved">
                {savedJobs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedJobs.map((job) => (
                      <Link key={job.id} href={`/jobb/${job.slug}`}>
                        <Card className="bg-card border-border card-hover h-full">
                          <CardContent className="p-5">
                            <h3 className="font-semibold text-foreground">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.companies?.name} · {job.location}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {(job.tech_tags ?? []).slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="text-center py-12 text-muted-foreground">
                      <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p>Du har inga sparade jobb ännu.</p>
                      <Button variant="outline" className="border-border mt-4" onClick={() => router.push("/jobb")}>
                        Utforska jobb
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="articles" className="space-y-6">
                {user && <ContinueReading userId={user.id} />}
                {user && <BookmarkedArticles userId={user.id} />}
              </TabsContent>

              <TabsContent value="events">
                <DashboardEvents />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default DashboardPage;
