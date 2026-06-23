import { CityNode, Dependency, DependencyType, Domain } from "./types";

const n = (id: string, label: string, domain: Domain, zone: string, criticality: number, threshold = 35, recoveryRate = 3, backupCapacity = 0, backupDuration = 0): CityNode => ({
  id, label, domain, zone, criticality, minimumThreshold: threshold, recoveryRate, backupCapacity, backupDuration, capacity: 100, status: "healthy"
});

export const createCityNodes = (): CityNode[] => [
  n("grid-control", "Grid Control", "power", "Central", 1, 45, 2, 25, 3),
  n("substation-n", "North Substation", "power", "North", .85), n("substation-s", "South Substation", "power", "South", .85),
  n("treatment", "Water Treatment", "water", "West", .95, 40, 2, 20, 2), n("pump-n", "North Water Pump", "water", "North", .8), n("pump-s", "South Water Pump", "water", "South", .8),
  n("telecom-auth", "Telecom Authentication", "telecom", "Central", .9, 40, 2, 15, 2), n("tower-n", "North Telecom Tower", "telecom", "North", .65), n("tower-s", "South Telecom Tower", "telecom", "South", .65),
  n("hospital-n", "North General Hospital", "health", "North", 1, 45, 1, 35, 4), n("hospital-s", "South Trauma Center", "health", "South", 1, 45, 1, 35, 4),
  n("bridge", "River Bridge", "transport", "Central", .7, 30, 4), n("ring-road", "Eastern Ring Road", "transport", "East", .65, 30, 4), n("transit", "Metro Transit", "transport", "Central", .55),
  n("fuel-depot", "Regional Fuel Depot", "fuel", "West", .85, 35, 2), n("fuel-n", "North Fuel Station", "fuel", "North", .65), n("fuel-s", "South Fuel Station", "fuel", "South", .65),
  n("payments", "Civic Payment Rail", "payment", "Central", .8, 40, 3, 10, 1),
  n("dispatch", "Emergency Dispatch", "emergency", "Central", 1, 45, 2, 25, 2), n("fire", "Fire & Rescue", "emergency", "East", .9), n("ambulance", "Ambulance Service", "emergency", "North", .95),
  n("data-center", "Municipal Data Center", "data", "Central", .9, 40, 2, 30, 3), n("command", "Municipal Command", "civic", "Central", .8),
  n("res-n", "North Residential Zone", "demand", "North", .7, 25, 1), n("res-s", "South Residential Zone", "demand", "South", .7, 25, 1), n("industry", "Industrial District", "demand", "West", .7, 30, 1),
  n("school", "Community Shelter", "civic", "East", .55), n("warehouse", "Medical Warehouse", "health", "West", .65),
];

let edgeNo = 0;
const e = (source: string, target: string, type: DependencyType, requiredSourceCapacity: number, impactStrength: number, propagationDelay: number, explanation: string): Dependency => ({
  id: `e${++edgeNo}-${source}-${target}`, source, target, type, requiredSourceCapacity, impactStrength, propagationDelay, recoveryCondition: `${source} restored above ${requiredSourceCapacity}%`, explanation
});

export const createDependencies = (): Dependency[] => {
  edgeNo = 0;
  return [
    e("grid-control","substation-n","DATA",45,55,1,"Grid telemetry is required to safely operate the north substation."), e("grid-control","substation-s","DATA",45,55,1,"Grid telemetry is required to safely operate the south substation."),
    e("data-center","grid-control","DATA",40,65,2,"Grid control loses forecasting and dispatch data."), e("substation-n","data-center","POWER",35,65,1,"The data center depends on north-grid power."), e("substation-s","data-center","POWER",35,30,1,"A secondary power feed limits data-center loss."),
    e("substation-n","pump-n","POWER",35,75,1,"The north pump requires grid power."), e("substation-s","pump-s","POWER",35,75,1,"The south pump requires grid power."), e("substation-s","treatment","POWER",35,70,1,"Treatment machinery requires south-grid power."),
    e("treatment","pump-n","WATER",40,60,2,"The pump cannot distribute untreated water."), e("treatment","pump-s","WATER",40,60,2,"The pump cannot distribute untreated water."),
    e("telecom-auth","tower-n","TELECOM",40,30,1,"The tower falls back to limited emergency-only service."), e("telecom-auth","tower-s","TELECOM",40,30,1,"The tower falls back to limited emergency-only service."), e("telecom-auth","payments","TELECOM",40,70,2,"Payment requests cannot authenticate."),
    e("data-center","telecom-auth","DATA",40,35,2,"Subscriber records become unavailable."), e("substation-n","tower-n","POWER",35,55,1,"Tower backup power is finite."), e("substation-s","tower-s","POWER",35,55,1,"Tower backup power is finite."),
    e("payments","fuel-n","PAYMENT",40,100,2,"Retail fuel transactions stop without payment authorization."), e("payments","fuel-s","PAYMENT",40,100,2,"Retail fuel transactions stop without payment authorization."),
    e("fuel-depot","fuel-n","FUEL",35,52,2,"North retail reserves cannot be replenished."), e("fuel-depot","fuel-s","FUEL",35,52,2,"South retail reserves cannot be replenished."), e("bridge","fuel-n","PHYSICAL_ACCESS",30,48,2,"Fuel tankers cannot reach the north station."), e("ring-road","fuel-s","PHYSICAL_ACCESS",30,48,2,"Fuel tankers cannot reach the south station."),
    e("fuel-n","hospital-n","FUEL",35,72,4,"Generator and ambulance fuel reserves are exhausted."), e("fuel-s","hospital-s","FUEL",35,72,4,"Generator and ambulance fuel reserves are exhausted."),
    e("pump-n","hospital-n","WATER",35,45,2,"Clinical operations require pressurized clean water."), e("pump-s","hospital-s","WATER",35,45,2,"Clinical operations require pressurized clean water."),
    e("tower-n","dispatch","TELECOM",35,52,2,"Emergency calls from the north cannot be routed."), e("tower-s","dispatch","TELECOM",35,52,2,"Emergency calls from the south cannot be routed."), e("data-center","dispatch","DATA",40,38,2,"Dispatch loses location and incident records."),
    e("dispatch","ambulance","TELECOM",45,68,1,"Ambulances cannot receive coordinated assignments."), e("dispatch","fire","TELECOM",45,68,1,"Fire crews cannot receive coordinated assignments."), e("bridge","ambulance","PHYSICAL_ACCESS",30,60,1,"The primary hospital route is blocked."), e("ring-road","fire","PHYSICAL_ACCESS",30,55,1,"Fire response routes become inaccessible."),
    e("substation-n","hospital-n","POWER",35,60,1,"Hospital switches to limited generator power."), e("substation-s","hospital-s","POWER",35,60,1,"Hospital switches to limited generator power."),
    e("hospital-n","res-n","STAFF",45,65,1,"North residents lose acute care access."), e("hospital-s","res-s","STAFF",45,65,1,"South residents lose acute care access."), e("pump-n","res-n","WATER",35,60,1,"North households lose water pressure."), e("pump-s","res-s","WATER",35,60,1,"South households lose water pressure."),
    e("substation-s","industry","POWER",35,62,1,"Industrial production loses power."), e("payments","industry","PAYMENT",40,35,2,"Industrial commerce cannot settle transactions."), e("dispatch","command","DATA",45,48,2,"Command loses a verified incident picture."), e("data-center","command","DATA",40,52,2,"Municipal decision systems go offline."),
    e("ring-road","transit","PHYSICAL_ACCESS",30,50,1,"Transit routing is obstructed."), e("substation-n","transit","POWER",35,50,1,"Metro traction power is unavailable."), e("warehouse","hospital-n","PHYSICAL_ACCESS",35,30,3,"Critical supplies cannot reach North General."), e("warehouse","hospital-s","PHYSICAL_ACCESS",35,30,3,"Critical supplies cannot reach South Trauma."),
  ];
};
