package util;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;

/**
 * This class computes the md5 checksum of a file.
 * 
 * @author Bart Mesuere
 * 
 */
public class Md5Checksum {

	private static byte[] createChecksum(String filename) throws FileNotFoundException,
			IOException, NoSuchAlgorithmException {
		InputStream fis = new FileInputStream(filename);

		byte[] buffer = new byte[1024];
		MessageDigest complete = MessageDigest.getInstance("MD5");
		int numRead;
		do {
			numRead = fis.read(buffer);
			if (numRead > 0) {
				complete.update(buffer, 0, numRead);
			}
		} while (numRead != -1);
		fis.close();
		return complete.digest();
	}

	// see this How-to for a faster way to convert
	// a byte array to a HEX string
	public static String getMD5Checksum(String filename) {
		try {
			byte[] b = createChecksum(filename);
			String result = "";
			for (int i = 0; i < b.length; i++) {
				result += Integer.toString((b[i] & 0xff) + 0x100, 16).substring(1);
			}
			return result;
		} catch (FileNotFoundException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error opening the file " + filename);
			e.printStackTrace();
			return "";
		} catch (IOException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error reading the file " + filename);
			e.printStackTrace();
			return "";
		} catch (NoSuchAlgorithmException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "There was a problem loading the MD5 algorithm");
			e.printStackTrace();
			return "";
		}
	}
}