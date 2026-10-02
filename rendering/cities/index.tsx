"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, X, Edit, MapPin, Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";
import { PageBody, DataTable } from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useCityStore } from "@/store/cityStore";
import { City } from "@/services/city.service";
import { AddEditCityModal } from "./addEditCityModal";

export function CitiesModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Zustand Store selectors for Cities
  const {
    cities,
    isLoadingCities,
    citiesLimit,
    citiesSearch,
    citiesIsActiveFilter,
    citiesNextCursor,
    citiesHistory,
    citiesTotal,
    setCitiesLimit,
    setCitiesFilters,
    resetCitiesFilters,
    fetchCities,
    goToNextCitiesPage,
    goToPreviousCitiesPage,
    createCity,
    updateCity,
  } = useCityStore(
    useShallow((state) => ({
      cities: state.cities,
      isLoadingCities: state.isLoadingCities,
      citiesLimit: state.citiesLimit,
      citiesSearch: state.citiesSearch,
      citiesIsActiveFilter: state.citiesIsActiveFilter,
      citiesNextCursor: state.citiesNextCursor,
      citiesHistory: state.citiesHistory,
      citiesTotal: state.citiesTotal,
      setCitiesLimit: state.setCitiesLimit,
      setCitiesFilters: state.setCitiesFilters,
      resetCitiesFilters: state.resetCitiesFilters,
      fetchCities: state.fetchCities,
      goToNextCitiesPage: state.goToNextCitiesPage,
      goToPreviousCitiesPage: state.goToPreviousCitiesPage,
      createCity: state.createCity,
      updateCity: state.updateCity,
    }))
  );

  // Modal Open/Edit States
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // Local Search Input States
  const [citySearchVal, setCitySearchVal] = useState(citiesSearch);
  const debouncedCitySearch = useDebounce(citySearchVal, 300);

  // Load Cities on mount
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Sync debounced search values to store
  useEffect(() => {
    if (debouncedCitySearch !== citiesSearch) {
      setCitiesFilters({ search: debouncedCitySearch });
    }
  }, [debouncedCitySearch, citiesSearch, setCitiesFilters]);

  // Sync back if filters are reset externally
  useEffect(() => {
    setCitySearchVal(citiesSearch);
  }, [citiesSearch]);

  // Cities Actions
  const handleAddCity = () => {
    setEditingCity(null);
    setCityModalOpen(true);
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCityModalOpen(true);
  };

  const handleToggleCityActive = async (city: City) => {
    try {
      await updateCity(city.id, {
        name: city.name,
        isActive: !city.isActive,
      });
      toast.success(`City "${city.name}" ${city.isActive ? "deactivated" : "activated"} successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update city status");
    }
  };

  const handleSaveCity = async (payload: any) => {
    if (editingCity) {
      await updateCity(editingCity.id, payload);
    } else {
      await createCity(payload);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      <div className="flex-1 overflow-y-auto">
        <PageBody>
          {/* Cities Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#2d7a4f]" />
                City Management
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure delivery cities, service launch states, and active operations.
              </p>
            </div>

            <Button
              onClick={handleAddCity}
              className="bg-[#2d7a4f] hover:bg-[#236040] text-white font-semibold gap-1.5 h-10 rounded-lg shrink-0 cursor-pointer shadow-sm text-xs"
            >
              <Plus className="h-4 w-4" />
              Add City
            </Button>
          </div>

          {/* Cities Filters Block */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-xs mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={citySearchVal}
                onChange={(e) => setCitySearchVal(e.target.value)}
                placeholder="Search cities by name, state, slug..."
                className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-xs"
              />
              {citySearchVal && (
                <button
                  onClick={() => setCitySearchVal("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {citiesSearch && (
              <Button
                variant="ghost"
                onClick={resetCitiesFilters}
                className="h-10 text-xs text-[#2d7a4f] hover:text-[#225c3c] hover:bg-[#2d7a4f]/5 font-semibold gap-1.5 cursor-pointer"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Cities DataTable */}
          <div className="space-y-4">
            {!mounted || isLoadingCities ? (
              <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                Loading cities…
              </div>
            ) : cities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
                <Search className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No cities found</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try adjusting search filters or add a new city.
                </p>
              </div>
            ) : (
              <>
                <DataTable
                  rows={cities}
                  columns={[
                    {
                      key: "name",
                      label: "City Name",
                      render: (c) => (
                        <span className="font-semibold text-foreground text-sm">
                          {c.name}
                        </span>
                      ),
                    },
                    {
                      key: "slug",
                      label: "Slug",
                      render: (c) => (
                        <span className="text-xs text-muted-foreground font-medium">
                          {c.slug}
                        </span>
                      ),
                    },
                    {
                      key: "state",
                      label: "State",
                      render: (c) => (
                        <span className="text-xs font-medium text-foreground">
                          {c.state}
                        </span>
                      ),
                    },
                    {
                      key: "country",
                      label: "Country",
                      render: (c) => (
                        <span className="text-xs text-muted-foreground font-medium">
                          {c.country}
                        </span>
                      ),
                    },
                    {
                      key: "status",
                      label: "Status",
                      className: "w-[150px]",
                      render: (c) => (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCityActive(c);
                            }}
                            className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d7a4f]/25 ${c.isActive ? "bg-[#2d7a4f]" : "bg-muted-foreground/30"
                              }`}
                          >
                            <span
                              className={`pointer-events-none block h-4.5 w-4.5 rounded-full bg-background shadow-md ring-0 transition-transform duration-200 ${c.isActive ? "translate-x-4.5" : "translate-x-0.5"
                                }`}
                            />
                          </button>
                          <span
                            className={`text-xs font-semibold select-none ${c.isActive ? "text-[#2d7a4f]" : "text-muted-foreground"
                              }`}
                          >
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: "actions",
                      label: "Actions",
                      className: "text-right w-[80px]",
                      render: (c) => (
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCity(c)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                            title="Edit City"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />

                {/* Offset/cursor pagination support */}
                <TablePagination
                  currentPage={citiesHistory.length + 1}
                  totalPages={citiesNextCursor ? citiesHistory.length + 2 : citiesHistory.length + 1}
                  limit={citiesLimit}
                  onPageChange={async (page) => {
                    if (page > citiesHistory.length + 1) {
                      await goToNextCitiesPage();
                    } else if (page < citiesHistory.length + 1) {
                      await goToPreviousCitiesPage();
                    }
                  }}
                  onLimitChange={setCitiesLimit}
                  totalItems={citiesTotal}
                />
              </>
            )}
          </div>
        </PageBody>
      </div>

      {/* Add / Edit City Dialog */}
      <AddEditCityModal
        open={cityModalOpen}
        onOpenChange={setCityModalOpen}
        editingCity={editingCity}
        onSave={handleSaveCity}
      />
    </div>
  );
}
