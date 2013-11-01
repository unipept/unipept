package xml;

public class UniprotDbRef {

	private String type;
	private String sequenceId;
	private String proteinId;

	public UniprotDbRef(String type, String sequenceId, String proteinId) {
		this.type = type;
		this.sequenceId = sequenceId;
		this.proteinId = proteinId;
	}

	public UniprotDbRef(String type) {
		this.type = type;
	}

	public String getType() {
		return type;
	}

	public String getSequenceId() {
		return sequenceId;
	}

	public void setSequenceId(String sequenceId) {
		this.sequenceId = sequenceId;
	}

	public String getProteinId() {
		return proteinId;
	}

	public void setProteinId(String proteinId) {
		this.proteinId = proteinId;
	}

}
