import {ISelectedArea} from "../../../services";
import {IArea} from "../../../../../services";

export interface IAreaCounts {
  name: string,
  typeId: number,
  descendants: IArea[],
}

export interface IAreasByTypeId {
  [key: string]: { name: string, descendants: IArea[] }
}

export function collectAreasByTypeId(area: ISelectedArea | null): IAreaCounts[] {
  let areaCounts: IAreaCounts[] = [];
  let areasByTypeId: IAreasByTypeId = {};
  if (area) {
    area.Descendants.forEach((value: IArea) => {
      if (areasByTypeId[value.TypeId]) {
        areasByTypeId[value.TypeId].descendants.push(value);
      } else {
        areasByTypeId[value.TypeId] = {name: value.Name, descendants: [value]}
      }
    })
  }

  Object.keys(areasByTypeId).forEach((key: string) => {
    areaCounts.push({
      name: areasByTypeId[key].name,
      typeId: Number(key),
      descendants: areasByTypeId[key].descendants
    })
  })

  return areaCounts;
}
