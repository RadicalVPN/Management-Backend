import { CachedEnforcer, newCachedEnforcer } from "casbin"

export class PermissionsEvaluator {
    static enforcer: CachedEnforcer
    private static model = "./policy/model.conf"
    private static policy = "./policy/policy.csv"

    public static async create() {
        return await new PermissionsEvaluator().setup()
    }

    private constructor() {}

    async setup() {
        if (!PermissionsEvaluator.enforcer) {
            PermissionsEvaluator.enforcer = await newCachedEnforcer(
                PermissionsEvaluator.model,
                PermissionsEvaluator.policy,
            )

            PermissionsEvaluator.configureEnforcer()
        }

        return this
    }

    /**
     *
     * @param sub Roles of the user
     * @param obj HTTP Path (Route)
     * @param act HTTP Method (GET, POST, PUT, DELETE)
     * @returns
     */
    async evaluate(sub: string[], obj: string, act: string) {
        for (const role of sub) {
            if (await PermissionsEvaluator.enforcer.enforce(role, obj, act)) {
                return true
            }
        }

        return false
    }

    async evaluateAnonymous(obj: string, act: string) {
        return await this.evaluate(["anonymous"], obj, act)
    }

    private static configureEnforcer() {
        PermissionsEvaluator.enforcer.enableLog(true)
    }
}
