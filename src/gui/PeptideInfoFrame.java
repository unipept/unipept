package gui;

import java.awt.BorderLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;
import javax.swing.JTable;
import javax.swing.JTextArea;

import storage.PeptideInfoData;

public class PeptideInfoFrame extends JFrame {

	private PeptideInfoData pid;
	private JSplitPane splitP;
	private JTextArea textArea;
	private JButton knop;
	private JTable table;
	private PeptideTableModel ptm;

	public PeptideInfoFrame(PeptideInfoData pid) {
		super("PeptideInfo (c) 2010 Bart Mesuere");
		this.pid = pid;
		addComponents();
		pack();
		setDefaultCloseOperation(EXIT_ON_CLOSE);
		setVisible(true);
	}

	private void addComponents() {
		ptm = new PeptideTableModel();
		table = new JTable(ptm);
		textArea = new JTextArea(5, 20);
		knop = new JButton("Retrieve peptide info");
		knop.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				ArrayList<String[]> res = pid.getPeptideInfo(textArea.getText());
				ptm.setData(res.toArray(new String[0][0]));
			}
		});
		JPanel jp = new JPanel(new BorderLayout());
		jp.add(textArea, BorderLayout.CENTER);
		jp.add(knop, BorderLayout.PAGE_END);
		splitP = new JSplitPane(JSplitPane.VERTICAL_SPLIT, jp, new JScrollPane(table));
		setContentPane(splitP);
	}
}
