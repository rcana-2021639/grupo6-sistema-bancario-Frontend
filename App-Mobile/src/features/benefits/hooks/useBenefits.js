import { useCallback, useMemo, useState } from "react";
import { useAuthStore } from "../../../shared/store/authStore";
import {
    benefitCatalog,
    getMyBenefitState,
    migrateLegacyBenefitsForUser,
    redeemBenefit,
    resetBenefitsForUser,
} from "../services/benefitsService";

export const useBenefits = () => {
    const { user } = useAuthStore();
    const role = user?.role || user?.Role || user?.roleName || user?.RoleName;
    const isAdmin = role === "ADMIN_ROLE";
    const [benefitState, setBenefitState] = useState({ redemptions: [], remaining: 2, maxRedemptions: 2 });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    const redemptionsByBenefit = useMemo(
        () => new Map(benefitState.redemptions.map((item) => [item.benefitId, item])),
        [benefitState.redemptions],
    );

    const fetchBenefits = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            await migrateLegacyBenefitsForUser(user);
            const state = await getMyBenefitState();
            setBenefitState(state);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await fetchBenefits({ silent: true });
    }, [fetchBenefits]);

    const redeem = useCallback(async (benefit) => {
        try {
            setSaving(true);
            const result = await redeemBenefit({ benefitId: benefit.id });
            setBenefitState(result.userState);
            return result;
        } finally {
            setSaving(false);
        }
    }, []);

    const resetUserBenefits = useCallback(async (targetKey) => {
        try {
            setSaving(true);
            await resetBenefitsForUser({ userIdentifier: targetKey });
            await fetchBenefits({ silent: true });
        } finally {
            setSaving(false);
        }
    }, [fetchBenefits]);

    return {
        benefits: benefitCatalog,
        benefitState,
        redemptionsByBenefit,
        loading,
        refreshing,
        saving,
        isAdmin,
        fetchBenefits,
        refresh,
        redeem,
        resetUserBenefits,
    };
};
