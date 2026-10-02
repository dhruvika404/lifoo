import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building, User, Map, ExternalLink, Phone, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { ChefDetail } from "@/services";

export function ChefAddressSection({ 
  chef, 
  activeAddressTab, 
  setActiveAddressTab, 
  approving, 
  handleApproveAddress 
}: { 
  chef: ChefDetail;
  activeAddressTab: "kitchen" | "residential";
  setActiveAddressTab: (tab: "kitchen" | "residential") => void;
  approving: boolean;
  handleApproveAddress: () => void;
}) {
  return (
    <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#2d7a4f]" />
              Address Details
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Manage kitchen operational locations and residential address records
            </CardDescription>
          </div>

          <div className="flex p-1 bg-muted/60 rounded-xl self-start sm:self-auto border border-border/30">
            <button
              onClick={() => setActiveAddressTab("kitchen")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeAddressTab === "kitchen"
                  ? "bg-background text-foreground shadow-sm border border-border/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              Kitchen ({chef.kitchenAddresses?.length || 0}{chef.pendingKitchen ? " + 1 Pending" : ""})
            </button>
            <button
              onClick={() => setActiveAddressTab("residential")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeAddressTab === "residential"
                  ? "bg-background text-foreground shadow-sm border border-border/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Residential
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {activeAddressTab === "kitchen" && (
          <div>
            {(!chef.kitchenAddresses || chef.kitchenAddresses.length === 0) && !chef.pendingKitchen ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <MapPin className="h-10 w-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">No kitchen addresses registered for this chef.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {chef.kitchenAddresses && chef.kitchenAddresses.map((address, idx) => (
                  <div key={address.id} className={`${idx > 0 ? "pt-8 border-t border-border/40" : ""}`}>
                    {chef.kitchenAddresses!.length > 1 && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1 rounded-md">
                          Kitchen #{idx + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Registered: {new Date(address.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Address Details</span>
                          <div className="text-sm text-foreground mt-2 leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/30">
                            <span className="font-semibold text-foreground block">{address.line1}</span>
                            {address.line2 && <span className="text-muted-foreground block mt-0.5">{address.line2}</span>}
                            {address.landmark && (
                              <span className="block text-xs text-[#2d7a4f] mt-1 font-medium italic">
                                Landmark: {address.landmark}
                              </span>
                            )}
                            <span className="block mt-2 font-medium text-foreground">
                              {address.city}, {address.state} — {address.pincode}
                            </span>
                            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                              {address.country}
                            </span>
                          </div>
                        </div>

                        {address.latitude && address.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/10 font-semibold transition-colors mt-2"
                          >
                            <Map className="h-3.5 w-3.5 shrink-0" />
                            <span>View on Google Maps</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Contact Information</span>
                          <div className="mt-2 space-y-2.5 bg-muted/15 p-4 rounded-xl border border-border/20">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Contact Person</span>
                              <span className="text-sm font-semibold text-foreground mt-0.5 block">{address.recipient || chef.displayName}</span>
                            </div>
                            {address.phone && (
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Phone Number</span>
                                <a href={`tel:${address.phone}`} className="text-sm font-mono font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 mt-0.5">
                                  <Phone className="h-3.5 w-3.5" />
                                  {address.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {chef.pendingKitchen && (
                  <div className={`${(chef.kitchenAddresses && chef.kitchenAddresses.length > 0) ? "pt-8 border-t border-dashed border-amber-500/30" : ""} bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20 shadow-sm relative overflow-hidden`}>
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                          Kitchen (Pending Approval)
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Submitted: {new Date(chef.pendingKitchen.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm relative z-10">
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Address Details</span>
                          <div className="text-sm text-foreground mt-2 leading-relaxed bg-background/50 p-4 rounded-xl border border-border/30">
                            <span className="font-semibold text-foreground block">{chef.pendingKitchen.line1}</span>
                            {chef.pendingKitchen.line2 && <span className="text-muted-foreground block mt-0.5">{chef.pendingKitchen.line2}</span>}
                            {chef.pendingKitchen.landmark && (
                              <span className="block text-xs text-amber-600 mt-1 font-medium italic">
                                Landmark: {chef.pendingKitchen.landmark}
                              </span>
                            )}
                            <span className="block mt-2 font-medium text-foreground">
                              {chef.pendingKitchen.city}, {chef.pendingKitchen.state} — {chef.pendingKitchen.pincode}
                            </span>
                            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                              {chef.pendingKitchen.country}
                            </span>
                          </div>
                        </div>

                        {chef.pendingKitchen.latitude && chef.pendingKitchen.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${chef.pendingKitchen.latitude},${chef.pendingKitchen.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/10 font-semibold transition-colors mt-2"
                          >
                            <Map className="h-3.5 w-3.5 shrink-0" />
                            <span>View on Google Maps</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Contact Information</span>
                          <div className="mt-2 space-y-2.5 bg-background/50 p-4 rounded-xl border border-border/20">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Contact Person</span>
                              <span className="text-sm font-semibold text-foreground mt-0.5 block">{chef.pendingKitchen.recipient || chef.displayName}</span>
                            </div>
                            {chef.pendingKitchen.phone && (
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Phone Number</span>
                                <a href={`tel:${chef.pendingKitchen.phone}`} className="text-sm font-mono font-semibold text-amber-600 hover:underline flex items-center gap-1.5 mt-0.5">
                                  <Phone className="h-3.5 w-3.5" />
                                  {chef.pendingKitchen.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            onClick={handleApproveAddress}
                            disabled={approving}
                            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20"
                          >
                            {approving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Approving Address...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve Kitchen Address
                              </>
                            )}
                          </Button>
                          <p className="text-[10px] text-muted-foreground mt-2">
                            Approving this will replace the current active kitchen address.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeAddressTab === "residential" && (
          <div>
            {!chef.residentialAddress ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <User className="h-10 w-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">No residential address registered.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Address Details</span>
                    <div className="text-sm text-foreground mt-2 leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/30">
                      <span className="font-semibold text-foreground block">{chef.residentialAddress.line1}</span>
                      {chef.residentialAddress.line2 && <span className="text-muted-foreground block mt-0.5">{chef.residentialAddress.line2}</span>}
                      {chef.residentialAddress.landmark && (
                        <span className="block text-xs text-[#2d7a4f] mt-1 font-medium italic">
                          Landmark: {chef.residentialAddress.landmark}
                        </span>
                      )}
                      <span className="block mt-2 font-medium text-foreground">
                        {chef.residentialAddress.city}, {chef.residentialAddress.state} — {chef.residentialAddress.pincode}
                      </span>
                      <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                        {chef.residentialAddress.country}
                      </span>
                    </div>
                  </div>

                  {chef.residentialAddress.latitude && chef.residentialAddress.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${chef.residentialAddress.latitude},${chef.residentialAddress.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/10 font-semibold transition-colors mt-2"
                    >
                      <Map className="h-3.5 w-3.5 shrink-0" />
                      <span>View on Google Maps</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Contact Information</span>
                    <div className="mt-2 space-y-2.5 bg-muted/15 p-4 rounded-xl border border-border/20">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Contact Person</span>
                        <span className="text-sm font-semibold text-foreground mt-0.5 block">{chef.residentialAddress.recipient || chef.displayName}</span>
                      </div>
                      {chef.residentialAddress.phone && (
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Phone Number</span>
                          <a href={`tel:${chef.residentialAddress.phone}`} className="text-sm font-mono font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 mt-0.5">
                            <Phone className="h-3.5 w-3.5" />
                            {chef.residentialAddress.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
