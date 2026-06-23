import { z } from "zod";
import { CityNode,Dependency } from "./types";

const topologySchema=z.object({name:z.string(),source:z.string(),sourceUrl:z.string().url(),baseMVA:z.number().positive(),buses:z.array(z.number().int()).min(2),generatorBuses:z.array(z.number().int()),branches:z.array(z.tuple([z.number().int(),z.number().int()])).min(1)});
export type GridTopology=z.infer<typeof topologySchema>;
export function importGridTopology(input:unknown):{nodes:CityNode[];dependencies:Dependency[];metadata:Pick<GridTopology,"name"|"source"|"sourceUrl"|"baseMVA">}{
 const parsed=topologySchema.parse(input),ids=new Set(parsed.buses);for(const [from,to] of parsed.branches)if(!ids.has(from)||!ids.has(to))throw new Error(`Branch ${from}-${to} references an unknown bus`);
 const generators=new Set(parsed.generatorBuses),nodes:CityNode[]=parsed.buses.map(bus=>({id:`grid-bus-${bus}`,label:`Grid Bus ${bus}`,domain:"power",capacity:100,minimumThreshold:35,recoveryRate:2,criticality:generators.has(bus)?.9:.6,zone:`IEEE14-${bus}`,backupCapacity:generators.has(bus)?20:0,backupDuration:generators.has(bus)?2:0,status:"healthy"}));
 const dependencies=parsed.branches.flatMap(([from,to],index)=>[[from,to],[to,from]].map(([source,target],direction):Dependency=>({id:`ieee14-${index}-${direction}`,source:`grid-bus-${source}`,target:`grid-bus-${target}`,type:"POWER",requiredSourceCapacity:35,impactStrength:45,propagationDelay:1,recoveryCondition:`Bus ${source} restored above 35%`,explanation:`Electrical transfer path ${source}–${target} is unavailable.`})));
 return{nodes,dependencies,metadata:{name:parsed.name,source:parsed.source,sourceUrl:parsed.sourceUrl,baseMVA:parsed.baseMVA}};
}
