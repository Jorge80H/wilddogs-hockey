import { db } from "@/lib/instant";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  Trophy,
  Newspaper,
  LogOut,
  Home,
  BookOpen,
  Star,
  Shield,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Link } from "wouter";
import { tx, id as txId } from "@instantdb/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading } = db.useAuth();

  const { data: userData, isLoading: userLoading } = db.useQuery(
    authUser ? { users: { $: { where: { id: authUser.id } } } } : null
  );

  const user = userData?.users?.[0] as any;
  const isLoading = authLoading || (!!authUser && userLoading);
  const isAdmin = user?.role === "admin";

  // ── Data Queries ────────────────────────────────
  const { data: allUsersData } = db.useQuery({ users: {} });
  const { data: profilesData } = db.useQuery({ playerProfiles: { user: {} } });
  const { data: matchesData } = db.useQuery({ matches: {} });
  const { data: feedbackData } = db.useQuery({
    playerFeedback: { player: { user: {} } },
  });
  const { data: materialsData } = db.useQuery({ trainingMaterials: {} });
  const { data: newsData } = db.useQuery({ newsPosts: {} });

  // ── Role editing state ──────────────────────────
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // ── News form state ─────────────────────────────
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");

  useEffect(() => {
    if (!isLoading && !authUser) {
      window.location.href = "/login";
    }
    if (!isLoading && authUser && !isAdmin) {
      toast({
        title: "Acceso Denegado",
        description: "No tienes permisos de administrador",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [authUser, isLoading, isAdmin, toast]);

  if (isLoading || !authUser || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4" />
          <p className="text-blue-200">Cargando...</p>
        </div>
      </div>
    );
  }

  const allUsers = (allUsersData?.users || []) as any[];
  const profiles = (profilesData?.playerProfiles || []) as any[];
  const matches = (matchesData?.matches || []) as any[];
  const feedback = (feedbackData?.playerFeedback || []) as any[];
  const materials = (materialsData?.trainingMaterials || []) as any[];
  const news = (newsData?.newsPosts || []) as any[];

  const totalPlayers = allUsers.filter((u) => u.role === "player").length;
  const totalCoaches = allUsers.filter((u) => u.role === "coach").length;
  const pendingUsers = allUsers.filter((u) => u.status === "pending").length;
  const recentMatches = matches.filter((m) => {
    const d = new Date(m.date);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return d >= thirtyDaysAgo && d <= now;
  }).length;

  const handleUpdateUser = async (userId: string) => {
    try {
      await db.transact([
        tx.users[userId].update({
          role: editRole,
          status: editStatus,
          updatedAt: Date.now(),
        }),
      ]);
      toast({ title: "✅ Usuario actualizado" });
      setEditingUserId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    try {
      await db.transact([tx.trainingMaterials[matId].delete()]);
      toast({ title: "✅ Material eliminado" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return { icon: <Shield className="h-3 w-3" />, color: "bg-orange-100 text-orange-800 border-orange-300" };
      case "coach":
        return { icon: <Star className="h-3 w-3" />, color: "bg-blue-100 text-blue-800 border-blue-300" };
      case "player":
        return { icon: <Trophy className="h-3 w-3" />, color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      default:
        return { icon: <Users className="h-3 w-3" />, color: "bg-gray-100 text-gray-800 border-gray-300" };
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "Activo", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-200" };
      case "pending":
        return { label: "Pendiente", cls: "bg-amber-500/10 text-amber-600 border-amber-200" };
      case "rejected":
        return { label: "Rechazado", cls: "bg-red-500/10 text-red-600 border-red-200" };
      default:
        return { label: status, cls: "bg-gray-500/10 text-gray-600 border-gray-200" };
    }
  };

  const statCards = [
    {
      label: "Jugadores",
      value: totalPlayers,
      sub: pendingUsers > 0 ? `${pendingUsers} pendientes` : "registrados",
      icon: <Users className="h-5 w-5" />,
      gradient: "from-blue-600 to-blue-800",
      iconBg: "bg-blue-400/20",
    },
    {
      label: "Entrenadores",
      value: totalCoaches,
      sub: `${allUsers.length} usuarios total`,
      icon: <Star className="h-5 w-5" />,
      gradient: "from-orange-500 to-orange-700",
      iconBg: "bg-orange-400/20",
    },
    {
      label: "Partidos (30d)",
      value: recentMatches,
      sub: `${matches.length} total`,
      icon: <Calendar className="h-5 w-5" />,
      gradient: "from-emerald-500 to-emerald-700",
      iconBg: "bg-emerald-400/20",
    },
    {
      label: "Evaluaciones",
      value: feedback.length,
      sub: `${materials.length} materiales`,
      icon: <Activity className="h-5 w-5" />,
      gradient: "from-purple-500 to-purple-700",
      iconBg: "bg-purple-400/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Header con gradiente de marca */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/assets/logo.webp"
                alt="Wild Dogs Hockey"
                className="h-10 w-10 rounded-xl shadow-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Panel de Administración
                </h1>
                <p className="text-sm text-blue-200">
                  Wild Dogs Hockey Club
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-100 hover:text-white hover:bg-white/10"
                >
                  <Home className="mr-2 h-4 w-4" /> Sitio
                </Button>
              </Link>
              <div className="hidden sm:block text-right">
                <div className="font-semibold text-sm">
                  {user?.firstName || authUser.email}
                </div>
                <div className="text-xs text-blue-300">Administrador</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-200 hover:text-white hover:bg-white/10"
                onClick={() => {
                  db.auth.signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards con gradiente */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((card) => (
            <motion.div key={card.label} variants={fadeIn}>
              <Card
                className={`bg-gradient-to-br ${card.gradient} text-white border-0 shadow-lg overflow-hidden relative`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <CardContent className="p-5 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/80">
                      {card.label}
                    </span>
                    <div
                      className={`${card.iconBg} p-2 rounded-lg backdrop-blur-sm`}
                    >
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{card.value}</div>
                  <p className="text-xs text-white/60 mt-1">{card.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs con estilo mejorado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-white/80 backdrop-blur border shadow-sm">
              <TabsTrigger
                value="users"
                className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Users className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Usuarios
              </TabsTrigger>
              <TabsTrigger
                value="feedback"
                className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Star className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Feedback
              </TabsTrigger>
              <TabsTrigger
                value="materials"
                className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <BookOpen className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Formación
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Newspaper className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Noticias
              </TabsTrigger>
            </TabsList>

            {/* ═══════════ Users Tab ═══════════ */}
            <TabsContent value="users">
              <Card className="border-0 shadow-md bg-white/90 backdrop-blur">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Users className="h-5 w-5 text-blue-600" />
                    Gestión de Usuarios
                    <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                      {allUsers.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {allUsers
                      .sort(
                        (a: any, b: any) =>
                          (b.createdAt || 0) - (a.createdAt || 0)
                      )
                      .map((u: any) => {
                        const role = roleLabel(u.role);
                        const status = statusBadge(u.status);
                        return (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {(
                                  u.firstName?.[0] ||
                                  u.email?.[0] ||
                                  "?"
                                ).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-slate-800">
                                    {u.firstName ||
                                      u.email?.split("@")[0]}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${role.color}`}
                                  >
                                    {role.icon} {u.role}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.cls}`}
                                  >
                                    {status.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {u.email}
                                </p>
                              </div>
                            </div>

                            {editingUserId === u.id ? (
                              <div className="flex items-center gap-2">
                                <select
                                  className="border rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editRole}
                                  onChange={(e) =>
                                    setEditRole(e.target.value)
                                  }
                                >
                                  <option value="admin">Admin</option>
                                  <option value="coach">Coach</option>
                                  <option value="player">Player</option>
                                  <option value="guardian">Guardian</option>
                                </select>
                                <select
                                  className="border rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editStatus}
                                  onChange={(e) =>
                                    setEditStatus(e.target.value)
                                  }
                                >
                                  <option value="approved">Aprobado</option>
                                  <option value="pending">Pendiente</option>
                                  <option value="rejected">Rechazado</option>
                                  <option value="inactive">Inactivo</option>
                                </select>
                                <Button
                                  size="sm"
                                  className="bg-emerald-500 hover:bg-emerald-600 h-8"
                                  onClick={() => handleUpdateUser(u.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8"
                                  onClick={() => setEditingUserId(null)}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setEditRole(u.role);
                                  setEditStatus(u.status);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" /> Editar
                              </Button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══════════ Feedback Tab ═══════════ */}
            <TabsContent value="feedback">
              <Card className="border-0 shadow-md bg-white/90 backdrop-blur">
                <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Star className="h-5 w-5 text-orange-500" />
                    Evaluaciones Recientes
                    <Badge className="ml-2 bg-orange-100 text-orange-700 border-orange-200">
                      {feedback.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {feedback.length > 0 ? (
                    <div className="space-y-3">
                      {feedback
                        .sort(
                          (a: any, b: any) => b.createdAt - a.createdAt
                        )
                        .slice(0, 20)
                        .map((fb: any) => {
                          const playerUser = fb.player?.[0]?.user?.[0];
                          const scores = [
                            fb.technicalScore,
                            fb.tacticalScore,
                            fb.physicalScore,
                            fb.attitudeScore,
                          ].filter(Boolean);
                          const avg =
                            scores.length > 0
                              ? scores.reduce(
                                  (s: number, v: number) => s + v,
                                  0
                                ) / scores.length
                              : 0;
                          const avgColor =
                            avg >= 7
                              ? "text-emerald-600"
                              : avg >= 5
                              ? "text-amber-600"
                              : "text-red-600";
                          return (
                            <div
                              key={fb.id}
                              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                  {(
                                    playerUser?.firstName?.[0] || "?"
                                  ).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-sm text-slate-800">
                                    {playerUser?.firstName || "Jugador"}{" "}
                                    {playerUser?.lastName || ""}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 capitalize">
                                      {fb.type === "post-match"
                                        ? "Post-partido"
                                        : fb.type}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {format(
                                        new Date(fb.createdAt),
                                        "d MMM yyyy",
                                        { locale: es }
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-2xl font-bold ${avgColor}`}
                                >
                                  {avg.toFixed(1)}
                                </div>
                                <div className="text-xs text-slate-400">
                                  promedio
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <Star className="h-8 w-8 text-orange-400" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        No hay evaluaciones registradas
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Los entrenadores pueden crearlas desde su panel
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══════════ Materials Tab ═══════════ */}
            <TabsContent value="materials">
              <Card className="border-0 shadow-md bg-white/90 backdrop-blur">
                <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Material de Formación
                    <Badge className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                      {materials.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {materials.length > 0 ? (
                    <div className="space-y-2">
                      {materials
                        .sort(
                          (a: any, b: any) => b.createdAt - a.createdAt
                        )
                        .map((mat: any) => (
                          <div
                            key={mat.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                                {mat.type === "video" ? (
                                  <BookOpen className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <FileText className="h-5 w-5 text-emerald-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-slate-800">
                                  {mat.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {mat.type}
                                  </span>
                                  {mat.difficulty && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                                      {mat.difficulty}
                                    </span>
                                  )}
                                  {mat.duration && (
                                    <span className="text-xs text-slate-400">
                                      ⏱ {mat.duration}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={mat.contentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                >
                                  Ver
                                </Button>
                              </a>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  handleDeleteMaterial(mat.id)
                                }
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 mx-auto mb-4 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-emerald-400" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        No hay material publicado
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Los entrenadores pueden subirlo desde su panel
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══════════ News Tab ═══════════ */}
            <TabsContent value="news">
              <Card className="border-0 shadow-md bg-white/90 backdrop-blur">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-transparent flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Newspaper className="h-5 w-5 text-purple-600" />
                    Noticias
                    <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-200">
                      {news.length}
                    </Badge>
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowNewsForm(!showNewsForm)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Nueva Noticia
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  {/* News Creation Form */}
                  {showNewsForm && (
                    <div className="border border-purple-200 rounded-xl p-5 mb-6 space-y-4 bg-purple-50/50">
                      <div>
                        <Label className="text-sm font-semibold text-purple-900">Título *</Label>
                        <Input
                          value={newsTitle}
                          onChange={(e) => setNewsTitle(e.target.value)}
                          placeholder="Ej: Victoria contundente contra Panthers"
                          className="mt-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-purple-900">Resumen corto</Label>
                        <Input
                          value={newsExcerpt}
                          onChange={(e) => setNewsExcerpt(e.target.value)}
                          placeholder="Una línea de resumen para la vista previa..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-purple-900">Contenido *</Label>
                        <textarea
                          value={newsContent}
                          onChange={(e) => setNewsContent(e.target.value)}
                          placeholder="Escribe el contenido completo de la noticia..."
                          className="w-full mt-1 border rounded-lg p-3 bg-white min-h-[120px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-purple-900">URL de imagen (opcional)</Label>
                        <Input
                          value={newsImageUrl}
                          onChange={(e) => setNewsImageUrl(e.target.value)}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={async () => {
                            if (!newsTitle.trim() || !newsContent.trim()) {
                              toast({ title: "Error", description: "Título y contenido son requeridos", variant: "destructive" });
                              return;
                            }
                            try {
                              const nId = txId();
                              await db.transact([
                                tx.newsPosts[nId].update({
                                  title: newsTitle.trim(),
                                  excerpt: newsExcerpt.trim() || undefined,
                                  content: newsContent.trim(),
                                  imageUrl: newsImageUrl.trim() || undefined,
                                  status: "published",
                                  publishedAt: Date.now(),
                                  createdAt: Date.now(),
                                  updatedAt: Date.now(),
                                }),
                              ]);
                              toast({ title: "✅ Noticia publicada" });
                              setShowNewsForm(false);
                              setNewsTitle("");
                              setNewsExcerpt("");
                              setNewsContent("");
                              setNewsImageUrl("");
                            } catch (error: any) {
                              toast({ title: "Error", description: error.message, variant: "destructive" });
                            }
                          }}
                        >
                          Publicar Ahora
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={async () => {
                            if (!newsTitle.trim()) {
                              toast({ title: "Error", description: "El título es requerido", variant: "destructive" });
                              return;
                            }
                            try {
                              const nId = txId();
                              await db.transact([
                                tx.newsPosts[nId].update({
                                  title: newsTitle.trim(),
                                  excerpt: newsExcerpt.trim() || undefined,
                                  content: newsContent.trim(),
                                  imageUrl: newsImageUrl.trim() || undefined,
                                  status: "draft",
                                  createdAt: Date.now(),
                                  updatedAt: Date.now(),
                                }),
                              ]);
                              toast({ title: "📝 Borrador guardado" });
                              setShowNewsForm(false);
                              setNewsTitle("");
                              setNewsExcerpt("");
                              setNewsContent("");
                              setNewsImageUrl("");
                            } catch (error: any) {
                              toast({ title: "Error", description: error.message, variant: "destructive" });
                            }
                          }}
                        >
                          Guardar como Borrador
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* News List */}
                  {news.length > 0 ? (
                    <div className="space-y-2">
                      {news
                        .sort((a: any, b: any) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
                        .map((n: any) => (
                          <div
                            key={n.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all group"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-slate-800">
                                {n.title}
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                {n.excerpt || n.content?.substring(0, 100)}
                              </p>
                              {n.publishedAt && (
                                <span className="text-xs text-slate-400">
                                  {format(new Date(n.publishedAt), "d MMM yyyy", { locale: es })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                  n.status === "published"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {n.status === "published" ? "Publicada" : "Borrador"}
                              </span>
                              {n.status === "draft" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 text-purple-600 hover:bg-purple-50"
                                  onClick={async () => {
                                    await db.transact([
                                      tx.newsPosts[n.id].update({ status: "published", publishedAt: Date.now(), updatedAt: Date.now() }),
                                    ]);
                                    toast({ title: "✅ Noticia publicada" });
                                  }}
                                >
                                  Publicar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                                onClick={async () => {
                                  await db.transact([tx.newsPosts[n.id].delete()]);
                                  toast({ title: "🗑 Noticia eliminada" });
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    !showNewsForm && (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                          <Newspaper className="h-8 w-8 text-purple-400" />
                        </div>
                        <p className="text-slate-500 font-medium">
                          No hay noticias publicadas
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Haz clic en "Nueva Noticia" para crear la primera
                        </p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
