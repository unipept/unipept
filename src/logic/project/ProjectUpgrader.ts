import type JSZip from "jszip";

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
    * Returns true if this upgrader can be applied to the given zipped
    * project.
     */
    canUpgrade(zippedProject: JSZip): Promise<boolean>;

    /**
     * Upgrade the given zipped project and return the upgraded archive.
     */
    upgrade(zippedProject: JSZip): Promise<JSZip>;
}
