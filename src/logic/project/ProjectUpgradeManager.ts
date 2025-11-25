import { SemVer } from "@/logic/project/SemVer";
import type JSZip from "jszip";
import type { ProjectUpgrader } from "@/logic/project/ProjectUpgrader";
import { From634To635Upgrader } from "@/logic/project/upgraders/From634To635Upgrader";

/**
 * Coordinates running a chain of {@link ProjectUpgrader}s until a project is
 * fully upgraded to the current application version.
 */
export class ProjectUpgradeManager {
    /**
     * Static registry of all known upgraders. When a new upgrader is
     * implemented, it can be added to this array.
     */
    private static readonly upgraders: ProjectUpgrader[] = [
        new From634To635Upgrader(),
    ];

    private static readonly currentVersion: string = APP_VERSION;

    /**
     * Upgrade the given zipped project in-place until its metadata version
     * matches the current application version, or no more upgraders apply.
     *
     * The manager is responsible for reading and updating the metadata.json
     * file that contains the project version; individual upgraders can
     * freely modify other parts of the archive.
     */
    public async upgradeIfNeeded(zippedProject: JSZip): Promise<JSZip> {
        const metadataFile = zippedProject.file("metadata.json");
        if (!metadataFile) {
            throw new Error("Failed to find metadata.json while performing project upgrade.");
        }

        const metadata = JSON.parse(await metadataFile.async("string")) as { version?: string };

        if (!metadata.version) {
            throw new Error("Project version is missing in metadata.json. Unable to perform upgrade.");
        }

        if (!SemVer.isOlder(metadata.version, ProjectUpgradeManager.currentVersion)) {
            // Already up to date; nothing to do.
            return zippedProject;
        }

        let upgradedZip: JSZip = zippedProject;

        for (const upgrader of ProjectUpgradeManager.upgraders) {
            if (await upgrader.canUpgrade(upgradedZip)) {
                upgradedZip = await upgrader.upgrade(upgradedZip);
            }
        }

        // Reload and update metadata.json in the final archive so that the
        // rest of the application sees the upgraded version.
        const finalMetadataFile = upgradedZip.file("metadata.json");
        if (!finalMetadataFile) {
            throw new Error("Failed to find metadata.json after project upgrade.");
        }

        const finalMetadata = JSON.parse(await finalMetadataFile.async("string"));
        finalMetadata.version = ProjectUpgradeManager.currentVersion;
        upgradedZip.file("metadata.json", JSON.stringify(finalMetadata));

        return upgradedZip;
    }
}
