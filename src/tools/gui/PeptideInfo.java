package tools.gui;

import gui.PeptideInfoFrame;
import storage.PeptideInfoData;

public class PeptideInfo {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		PeptideInfoData data = new PeptideInfoData();
		new PeptideInfoFrame(data);
	}

}
