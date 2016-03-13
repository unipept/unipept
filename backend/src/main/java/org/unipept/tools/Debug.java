package org.unipept.tools;

public class Debug {
    public static String memory() {
        Runtime rt = Runtime.getRuntime();
        long usedMB = (rt.totalMemory() - rt.freeMemory()) / 1000000;
        long allocatedMB = rt.totalMemory() / 1000000;
        long maxMB = rt.maxMemory() / 1000000;
        return usedMB + "MB (allocated: " + allocatedMB + "MB, max: " + maxMB + "MB)";
    }
}
