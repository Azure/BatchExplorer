import * as moment from "moment";

export class ProxyUtil {
    public static decoratePool(pool: any): any {
        if (pool.autoScaleEvaluationInterval && pool.autoScaleEvaluationInterval._data) {
            pool.autoScaleEvaluationInterval = moment.duration(pool.autoScaleEvaluationInterval._data);
        }
        return pool;
    }
}
