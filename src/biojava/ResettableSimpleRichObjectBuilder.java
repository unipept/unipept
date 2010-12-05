/**
 * 
 */
package biojava;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.biojavax.RichObjectBuilder;

/**
 * @author Bart Mesuere
 * 
 */
public class ResettableSimpleRichObjectBuilder implements RichObjectBuilder {

	private static Map objects = new HashMap();

	/**
	 * {@inheritDoc} Instantiates and returns objects, that's all there is to
	 * it.
	 */
	public Object buildObject(Class clazz, List paramsList) {
		// put the class into the hashmap if not there already
		if (!objects.containsKey(clazz))
			objects.put(clazz, new HashMap());
		Map contents = (Map) objects.get(clazz);
		// convert the params list to remove nulls as we can't process those.
		List ourParamsList = new ArrayList(paramsList);
		for (Iterator i = ourParamsList.iterator(); i.hasNext();)
			if (i.next() == null)
				i.remove();
		// return the constructed object from the hashmap if there already
		if (contents.containsKey(ourParamsList))
			return contents.get(ourParamsList);
		// otherwise build it.
		try {
			// Load the class
			Class[] types = new Class[ourParamsList.size()];
			// Find its constructor with given params
			for (int i = 0; i < ourParamsList.size(); i++) {
				if (ourParamsList.get(i) instanceof Set)
					types[i] = Set.class;
				else if (ourParamsList.get(i) instanceof Map)
					types[i] = Map.class;
				else if (ourParamsList.get(i) instanceof List)
					types[i] = List.class;
				else
					types[i] = ourParamsList.get(i).getClass();
			}
			Constructor c = clazz.getConstructor(types);
			// Instantiate it with the parameters
			Object o = c.newInstance(ourParamsList.toArray());
			// store it for later in the singleton map
			contents.put(ourParamsList, o);
			// return it
			return o;
		} catch (Exception e) {
			StringBuffer paramsstuff = new StringBuffer();
			paramsstuff.append(clazz);
			paramsstuff.append("(");
			for (int i = 0; i < ourParamsList.size(); i++) {
				if (i > 0)
					paramsstuff.append(",");
				paramsstuff.append(ourParamsList.get(i).getClass());
			}
			paramsstuff.append(")");
			IllegalArgumentException ie = new IllegalArgumentException(
					"Could not find constructor for " + paramsstuff);
			ie.initCause(e);
			throw ie;
		}
	}

	public void reset() {
		objects.clear();
	}

}
