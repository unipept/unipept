package gui;

import javax.swing.table.AbstractTableModel;

public class PeptideTableModel extends AbstractTableModel {
	private String[] columnNames = { "species", "# genomes with peptide", "percentage" };
	private String[][] data = new String[0][0];

	public int getColumnCount() {
		return columnNames.length;
	}

	public int getRowCount() {
		return data.length;
	}

	public String getColumnName(int col) {
		return columnNames[col];
	}

	public Object getValueAt(int row, int col) {
		if (col == 1)
			return data[row][col] + "/" + data[row][col + 1];
		if (col == 2)
			return Double.valueOf(data[row][col + 1]) * 100 + "%";
		return data[row][col];
	}

	public Class getColumnClass(int c) {
		return getValueAt(0, c).getClass();
	}

	public void setData(String[][] lijst) {
		data = lijst;
		fireTableDataChanged();
	}
}
