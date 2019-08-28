export default interface ProgressListener {
    /**
     * This method is called when the process of a process is updated.
     * 
     * @param progress The current progress as a floating point value between 0 and 1, where 1 means the process is
     * fully completed.
     */
    onProgressUpdate(progress: number): void;
}