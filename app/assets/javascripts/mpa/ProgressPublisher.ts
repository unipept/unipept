import ProgressListener from "./ProgressListener";

export default class ProgressPublisher
{
    private _progressListeners: ProgressListener[] = [];

    public registerProgressListener(listener: ProgressListener): void {
        this._progressListeners.push(listener);
    }

    protected updateProgress(value: number): void {
        for (let listener of this._progressListeners) {
            listener.onProgressUpdate(value);
        }
    }
}