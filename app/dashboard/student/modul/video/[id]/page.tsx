"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Eye,
  Clock,
  Star,
  Download,
  Share2,
  BookOpen,
  Loader2,
} from "lucide-react";

interface Modul {
  id: string;
  type: "video" | "pdf";
  category: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  content_url: string;
  duration?: string;
  views?: number;
  rating?: number;
  is_premium: boolean;
  is_active: boolean;
}

// Extract YouTube video ID from URL
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [modul, setModul] = useState<Modul | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedModuls, setRelatedModuls] = useState<Modul[]>([]);

  useEffect(() => {
    if (id) {
      fetchModul();
      incrementViews();
    }
  }, [id]);

  const fetchModul = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch current modul
      const { data, error } = await supabase
        .from("moduls")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (!error && data) {
        setModul(data as Modul);
        
        // Fetch related moduls (same category, type = video)
        const { data: related } = await supabase
          .from("moduls")
          .select("*")
          .eq("type", "video")
          .eq("category", data.category)
          .eq("is_active", true)
          .neq("id", id)
          .limit(5);
        
        if (related) {
          setRelatedModuls(related as Modul[]);
        }
      }
    } catch (err) {
      console.error("Error fetching modul:", err);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const supabase = createClient();
      await supabase.rpc("increment_modul_views", { modul_id: id });
    } catch (err) {
      console.error("Error incrementing views:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-600 font-semibold">Memuat video...</p>
      </div>
    );
  }

  if (!modul) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
        <p className="text-slate-600 font-semibold text-lg">Video tidak ditemukan</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  const youtubeId = getYouTubeId(modul.content_url);

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Modul
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <Card className="overflow-hidden rounded-xl md:rounded-2xl bg-black">
              {youtubeId ? (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                    title={modul.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-slate-900 text-white">
                  <p className="text-sm">Format video tidak didukung</p>
                </div>
              )}
            </Card>

            {/* Video Info */}
            <Card className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white">
              <div className="space-y-4">
                <div>
                  <Badge className="text-xs font-bold bg-blue-100 text-blue-700 mb-3">
                    {modul.category}
                  </Badge>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                    {modul.title}
                  </h1>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  {modul.views && (
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">{modul.views.toLocaleString()} views</span>
                    </div>
                  )}
                  {modul.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">{modul.duration}</span>
                    </div>
                  )}
                  {modul.rating && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{modul.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {modul.description && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {modul.description}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg gap-2"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link disalin!");
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Bagikan
                  </Button>
                  {modul.is_premium && (
                    <Badge className="bg-blue-500 text-white font-bold text-xs px-3 py-1">
                      PREMIUM
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-bold text-slate-900">Video Terkait</h3>
            
            {relatedModuls.length === 0 ? (
              <Card className="p-6 rounded-xl text-center bg-white">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Tidak ada video terkait</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {relatedModuls.map((related) => {
                  const relatedYoutubeId = getYouTubeId(related.content_url);
                  return (
                    <Card
                      key={related.id}
                      className="p-3 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/dashboard/student/modul/video/${related.id}`)}
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          {relatedYoutubeId ? (
                            <img
                              src={`https://img.youtube.com/vi/${relatedYoutubeId}/mqdefault.jpg`}
                              alt={related.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                          {related.duration && (
                            <Badge className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0">
                              {related.duration}
                            </Badge>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-1">
                            {related.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mb-1">{related.category}</p>
                          {related.views && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Eye className="h-3 w-3" />
                              <span>{related.views.toLocaleString()} views</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
