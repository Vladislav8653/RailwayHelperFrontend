import { RailwayStation } from '../models/RailwayStation.js';
import { PlaceInfo } from '../models/PlaceInfo.js';

export class StationMapper {
    static toModel(dto) {
        return new RailwayStation(
            dto.value,   // StationId
            dto.exp  // StationName
        );
    }
    
    static toPlaceInfoModel(dto) {
        if (!dto) return null;

        return new PlaceInfo(
            this.toModel(dto.StationFrom),
            this.toModel(dto.StationTo)
        );
    }

    static toModelList(dtoList) {
        if (!Array.isArray(dtoList)) return [];
        return dtoList.map(this.toModel);
    }
}