import { SemVer } from "@/logic/SemVer";

/**
 * Minimal shape for a project as needed by the upgrader.
 *
 * It is intentionally loose to avoid importing heavier types here while still
 * ensuring we have access to a semantic version field.
 */
export interface VersionedProject {
    version?: string;
    [key: string]: unknown;
}

/**
 * A single step that can upgrade a project from one specific version range to
 * the next. Implementations should be pure (no external side effects) and
 * always return a new/updated project object.
 */
export interface ProjectUpgrader {
    /**
     * Human readable name for debugging/logging.
     */
    readonly name: string;

    /**
     * Returns true if this upgrader can be applied to the given project.
     */
    canUpgrade(project: VersionedProject): boolean;

    /**
     * Upgrade the given project and return the upgraded version.
     */
    upgrade(project: VersionedProject): VersionedProject;
}

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
        // Add concrete ProjectUpgrader instances here, e.g.:
        // new From620To630Upgrader(),
        // new From630To640Upgrader(),
    ];

    private static readonly currentVersion: string = APP_VERSION;

    /**
     * Upgrade the given project in-place until its version matches the
     * current application version, or no more upgraders apply.
     */
    public upgradeIfNeeded<T extends VersionedProject>(project: T): T {
        if (!project.version) {
            // If we do not know the version, we currently treat this as
            // "already compatible" and skip upgrades. This can be adjusted once
            // we know how legacy, unversioned projects should be handled.
            return project;
        }

        if (!SemVer.isOlder(project.version, ProjectUpgradeManager.currentVersion)) {
            return project;
        }

        let upgraded: VersionedProject = project;
        let applied = false;

        do {
            applied = false;

            for (const upgrader of ProjectUpgradeManager.upgraders) {
                if (upgrader.canUpgrade(upgraded)) {
                    upgraded = upgrader.upgrade(upgraded);
                    applied = true;
                }
            }
        } while (applied && upgraded.version && SemVer.isOlder(upgraded.version, ProjectUpgradeManager.currentVersion));

        return upgraded as T;
    }
}
