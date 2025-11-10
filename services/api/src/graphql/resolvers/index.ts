import {CustomerQueryResolvers} from "./customer";
import {ProjectQueryResolvers} from "./project";
import {EnergyAssetQueryResolvers} from "./energyAsset";

const resolvers = {
    Query: {
        ...CustomerQueryResolvers,
        ...ProjectQueryResolvers,
        ...EnergyAssetQueryResolvers
    }
};

export default resolvers;