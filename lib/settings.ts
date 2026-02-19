
import prisma from "@/lib/prisma";

export const getSetting = async (key: string): Promise<string | null> => {
    // @ts-ignore - Propiedad existe pero TypeScript no ha recargado los tipos
    const setting: { value: string } | null = await prisma.systemSetting.findUnique({
        where: { key },
    });
    return setting?.value || null;
};

export const setSetting = async (key: string, value: string, description?: string): Promise<void> => {
    // @ts-ignore - Propiedad existe pero TypeScript no ha recargado los tipos
    await prisma.systemSetting.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description },
    });
};

export const getSettings = async (keys: string[]): Promise<Record<string, string | null>> => {
    // @ts-ignore - Propiedad existe pero TypeScript no ha recargado los tipos
    const settings: { key: string; value: string }[] = await prisma.systemSetting.findMany({
        where: { key: { in: keys } },
    });

    // Convert to map
    const result: Record<string, string | null> = {};
    keys.forEach(k => {
        const found = settings.find(s => s.key === k);
        result[k] = found ? found.value : null;
    });

    return result;
}
