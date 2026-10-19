"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  GripVertical,
  Loader2,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";

import {
  PageHeader,
  PageBody,
  StatusBadge,
} from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useSplashScreenStore } from "@/store/splashScreenStore";
import {
  SplashScreen,
  TargetPlatform,
  TargetAudience,
} from "@/services/splashScreen.service";
import { getS3ImageUrl } from "@/lib/s3-utils";
import { AddEditSplashScreenModal } from "./addEditSplashScreenModal";

export function SplashScreensModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Zustand Store selectors
  const {
    splashScreens,
    isLoading,
    isReordering,
    error,
    limit,
    nextCursor,
    history,
    search,
    isActiveFilter,
    targetPlatformFilter,
    targetAudienceFilter,
    setLimit,
    setFilters,
    resetFilters,
    fetchSplashScreens,
    goToNextPage,
    goToPreviousPage,
    createSplashScreen,
    updateSplashScreen,
    toggleActive,
    reorderSplashScreens,
    deleteSplashScreen,
  } = useSplashScreenStore(
    useShallow((state) => ({
      splashScreens: state.splashScreens,
      isLoading: state.isLoading,
      isReordering: state.isReordering,
      error: state.error,
      limit: state.limit,
      nextCursor: state.nextCursor,
      history: state.history,
      search: state.search,
      isActiveFilter: state.isActiveFilter,
      targetPlatformFilter: state.targetPlatformFilter,
      targetAudienceFilter: state.targetAudienceFilter,
      setLimit: state.setLimit,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
      fetchSplashScreens: state.fetchSplashScreens,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      createSplashScreen: state.createSplashScreen,
      updateSplashScreen: state.updateSplashScreen,
      toggleActive: state.toggleActive,
      reorderSplashScreens: state.reorderSplashScreens,
      deleteSplashScreen: state.deleteSplashScreen,
    }))
  );

  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<SplashScreen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SplashScreen | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  useEffect(() => {
    fetchSplashScreens();
  }, [fetchSplashScreens]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  const handleOpenAdd = () => {
    setEditingScreen(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (screen: SplashScreen) => {
    setEditingScreen(screen);
    setModalOpen(true);
  };

  const handleSave = async (payload: any) => {
    if (editingScreen) {
      await updateSplashScreen(editingScreen.id, payload);
    } else {
      await createSplashScreen(payload);
    }
  };

  const handleToggleActive = async (screen: SplashScreen) => {
    try {
      await toggleActive(screen.id, screen.isActive, screen);
      toast.success(
        `Splash screen ${!screen.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update status"
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSplashScreen(deleteTarget.id);
      toast.success(`Splash screen "${deleteTarget.title}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete splash screen"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDrop = async (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    const currentDrag = dragIndex;
    setDragIndex(null);

    try {
      await reorderSplashScreens(currentDrag, dropIndex);
      toast.success("Display order updated successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update display order"
      );
    }
  };

  const hasActiveFilters =
    Boolean(search) ||
    isActiveFilter !== undefined ||
    targetPlatformFilter !== undefined ||
    targetAudienceFilter !== undefined;

  const handleClearFilters = () => {
    setSearchVal("");
    resetFilters();
  };

  if (!mounted) return null;

  return (
    <>
      <PageHeader
        title="Splash Screen Management"
        description="Organize onboarding splash screens, visual banners, and mobile app launch ordering"
        actions={
          <Button
            onClick={handleOpenAdd}
            className="bg-[#2d7a4f] hover:bg-[#236040] text-white gap-1.5 font-semibold cursor-pointer shadow-sm transition-all h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            New Splash Screen
          </Button>
        }
      />

      <PageBody>
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 pb-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search splash screens by title..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm w-full"
            />
            {searchVal && (
              <button
                onClick={() => setSearchVal("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Platform Filter */}
          <Select
            value={targetPlatformFilter || "ALL_PLATFORMS"}
            onValueChange={(val) =>
              setFilters({
                targetPlatform: val === "ALL_PLATFORMS" ? undefined : (val as TargetPlatform),
              })
            }
          >
            <SelectTrigger className="w-[140px] h-10 border-border/60 bg-background rounded-lg text-sm shrink-0">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_PLATFORMS">All Platforms</SelectItem>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="ANDROID">Android</SelectItem>
              <SelectItem value="IOS">iOS</SelectItem>
            </SelectContent>
          </Select>

          {/* Audience Filter */}
          <Select
            value={targetAudienceFilter || "ALL_AUDIENCES"}
            onValueChange={(val) =>
              setFilters({
                targetAudience: val === "ALL_AUDIENCES" ? undefined : (val as TargetAudience),
              })
            }
          >
            <SelectTrigger className="w-[140px] h-10 border-border/60 bg-background rounded-lg text-sm shrink-0">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_AUDIENCES">All Audiences</SelectItem>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="CHEF">Chef</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={
              isActiveFilter === undefined
                ? "ALL_STATUS"
                : isActiveFilter
                  ? "ACTIVE"
                  : "INACTIVE"
            }
            onValueChange={(val) =>
              setFilters({
                isActive:
                  val === "ALL_STATUS"
                    ? undefined
                    : val === "ACTIVE",
              })
            }
          >
            <SelectTrigger className="w-[130px] h-10 border-border/60 bg-background rounded-lg text-sm shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_STATUS">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 px-3 text-sm text-[#2d7a4f] hover:text-[#236040] hover:bg-[#2d7a4f]/10 font-semibold gap-1.5 shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table Container (Matching Categories & Products) */}
        <div className="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4 w-16">Image</th>
                  <th className="py-3 px-4">Title & Subtitle</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLoading && splashScreens.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                      Loading splash screens…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-destructive">
                      <p className="text-sm font-semibold">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSplashScreens()}
                        className="mt-3 h-8 text-xs cursor-pointer"
                      >
                        Retry
                      </Button>
                    </td>
                  </tr>
                ) : splashScreens.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted-foreground">
                      <Smartphone className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="font-semibold text-foreground text-sm">
                        No splash screens found
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {hasActiveFilters
                          ? "Try clearing filters to see all items."
                          : "Create your first splash screen for mobile apps."}
                      </p>
                      {!hasActiveFilters && (
                        <Button
                          onClick={handleOpenAdd}
                          className="mt-4 bg-[#2d7a4f] hover:bg-[#236040] text-white h-9 px-4 text-xs font-semibold cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          New Splash Screen
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  splashScreens.map((screen, idx) => {
                    const imgUrl = getS3ImageUrl(screen.imageUrl);
                    return (
                      <tr
                        key={screen.id}
                        draggable
                        onDragStart={() => setDragIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(idx)}
                        className={`group hover:bg-muted/20 transition-colors ${dragIndex === idx
                          ? "bg-[#2d7a4f]/10 border-l-4 border-l-[#2d7a4f]"
                          : ""
                          }`}
                      >
                        {/* Order Column with Grip Handle */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing" />
                            <span className="text-xs font-mono text-muted-foreground">
                              {screen.displayOrder ?? idx + 1}
                            </span>
                          </div>
                        </td>

                        {/* Image Thumbnail with Lightbox */}
                        <td className="py-3 px-4">
                          <div
                            onClick={() => imgUrl && setPreviewImage(imgUrl)}
                            className="h-11 w-11 rounded-lg border border-border/60 bg-muted/30 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity"
                            title="Click to view full image"
                          >
                            {imgUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={imgUrl}
                                alt={screen.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-xs font-semibold text-muted-foreground uppercase">
                                {screen.title.substring(0, 2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Title & Subtitle */}
                        <td className="py-3 px-4 font-medium text-foreground">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-foreground leading-snug">
                              {screen.title}
                            </p>
                            {screen.subtitle && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {screen.subtitle}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Description Column */}
                        <td className="py-3 px-4 text-muted-foreground max-w-[220px]">
                          {screen.description ? (
                            <p
                              className="text-xs text-muted-foreground/90 truncate cursor-help"
                              title={screen.description}
                            >
                              {screen.description}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 italic">
                              —
                            </span>
                          )}
                        </td>

                        {/* Target Platform Badge */}
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="text-[11px] font-normal text-muted-foreground border-border/80"
                          >
                            {screen.targetPlatform === "IOS"
                              ? "iOS"
                              : screen.targetPlatform === "ANDROID"
                                ? "Android"
                                : "All"}
                          </Badge>
                        </td>

                        {/* Target Audience Badge */}
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="text-[11px] font-normal text-muted-foreground border-border/80"
                          >
                            {screen.targetAudience === "CUSTOMER"
                              ? "Customer"
                              : screen.targetAudience === "CHEF"
                                ? "Chef"
                                : "All"}
                          </Badge>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <StatusBadge value={screen.isActive ? "Active" : "Inactive"} />
                        </td>

                        {/* Action Buttons (Edit, Eye/EyeOff toggle, Delete) */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(screen)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(screen)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                              title={screen.isActive ? "Mark Inactive" : "Mark Active"}
                            >
                              {screen.isActive ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(screen)}
                              className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {splashScreens.length > 0 && (
            <TablePagination
              currentPage={history.length + 1}
              totalPages={nextCursor ? history.length + 2 : history.length + 1}
              limit={limit}
              onPageChange={async (page) => {
                if (page > history.length + 1) {
                  await goToNextPage();
                } else if (page < history.length + 1) {
                  await goToPreviousPage();
                }
              }}
              onLimitChange={setLimit}
              totalItems={splashScreens.length}
            />
          )}
        </div>
      </PageBody>

      {/* Add / Edit Splash Screen Modal */}
      <AddEditSplashScreenModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingScreen={editingScreen}
        onSave={handleSave}
        suggestedDisplayOrder={splashScreens.length + 1}
      />

      {/* Delete Confirmation Modal (Styled like EntityDeleteModal) */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md border border-border bg-background shadow-2xl rounded-xl p-6">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 text-center">
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                Delete Splash Screen
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-foreground">&ldquo;{deleteTarget?.title}&rdquo;</strong>?
                This action is permanent and will remove it from mobile app startup.
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="h-10 rounded-lg border border-border hover:bg-muted text-foreground transition-all duration-200 font-medium flex-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="h-10 rounded-lg font-medium shadow-sm transition-all duration-200 flex-1 bg-destructive hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting…
                </>
              ) : (
                "Delete Splash Screen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Image Preview Modal */}
      <Dialog open={Boolean(previewImage)} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-md p-2 bg-background border-border rounded-xl">
          <div className="relative max-h-[80vh] flex items-center justify-center overflow-hidden rounded-lg bg-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage || ""}
              alt="Splash Screen Preview"
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
