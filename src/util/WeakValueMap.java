package util;

import java.lang.ref.Reference;
import java.lang.ref.ReferenceQueue;
import java.lang.ref.WeakReference;
import java.util.AbstractMap;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**
 * A <code>java.util.Map</code> implementation with weak values.
 * <p>
 * The values are stored in the map as weak references. If the garbage collector
 * clears the reference, the corresponding key is automatically removed from the
 * map.
 * 
 * @author <a href="mailto:mmartin5@austin.rr.com">Mike Martin</a>
 * @version $Revision: 1.5 $
 * 
 * @see WeakReference
 */

public class WeakValueMap extends ReferenceValueMap {
	public WeakValueMap() {
		super(new HashMap());
	}

	public WeakValueMap(int initialCapacity) {
		super(new HashMap(initialCapacity));
	}

	public WeakValueMap(int initialCapacity, float loadFactor) {
		super(new HashMap(initialCapacity, loadFactor));
	}

	public WeakValueMap(Map m) {
		super(new HashMap(m));
	}

	protected Reference newReference(Object value) {
		return new WeakReference(value, refQueue);
	}
}

/**
 * A <code>java.util.Map</code> implementation using reference values.
 * <p>
 * The values are stored in the map as references. If the garbage collector
 * clears the reference, the corresponding key is automatically removed from the
 * map.
 * 
 * @author <a href="mailto:jackknifebarber@users.sourceforge.net">Mike
 *         Martin</a>
 * @version $Revision: 1.8 $
 */

abstract class ReferenceValueMap extends AbstractMap {
	protected final ReferenceQueue refQueue = new ReferenceQueue();
	/** Backing map. */
	private final Map backing;

	ReferenceValueMap(Map backing) {
		this.backing = backing;
	}

	/**
	 * Returns a new <code>Reference</code> object to be inserted into the map.
	 * Subclasses must implement this method to construct <code>Reference</code>
	 * objects of the desired type (e.g. <code>SoftReference</code>, etc.).
	 * 
	 * @param value
	 *            The associated value to be referenced.
	 * 
	 * @return A new <code>Reference</code> object to be inserted into the map.
	 */
	protected abstract Reference newReference(Object value);

	private void reap() {
		Reference ref;

		while ((ref = refQueue.poll()) != null)
			backing.values().remove(ref);
	}

	public Object put(Object key, Object value) {
		reap();
		return backing.put(key, newReference(value));
	}

	public Object get(Object key) {
		reap();

		Object v = backing.get(key);

		return (v instanceof Reference) ? ((Reference) v).get() : v;
	}

	public int size() {
		reap();
		return backing.size();
	}

	public boolean isEmpty() {
		reap();
		return backing.isEmpty();
	}

	public boolean containsKey(Object key) {
		reap();
		return backing.containsKey(key);
	}

	public boolean containsValue(Object value) {
		reap();
		return super.containsValue(value);
	}

	public Set keySet() {
		reap();
		return backing.keySet();
	}

	public Collection values() {
		reap();
		return super.values();
	}

	public Set entrySet() {
		reap();
		return new EntrySet();
	}

	public Object remove(Object key) {
		reap();
		return backing.remove(key);
	}

	public int hashCode() {
		reap();
		return super.hashCode();
	}

	public boolean equals(Object o) {
		reap();
		return super.equals(o);
	}

	public String toString() {
		reap();
		return super.toString();
	}

	static boolean eq(Object o1, Object o2) {
		return o1 == null ? o2 == null : o1.equals(o2);
	}

	private class EntrySet extends AbstractSet {
		/** Backing set. */
		private final Set set = backing.entrySet();

		public Iterator iterator() {
			return new Iterator() {
				private Iterator i = set.iterator();

				public boolean hasNext() {
					return i.hasNext();
				}

				public void remove() {
					i.remove();
				}

				public Object next() {
					final Map.Entry ent = (Map.Entry) i.next();

					return new Map.Entry() {
						public Object getKey() {
							return ent.getKey();
						}

						public Object getValue() {
							Object v = ent.getValue();

							return (v instanceof Reference) ? ((Reference) v).get() : v;
						}

						public Object setValue(Object v) {
							Object oldVal = getValue();
							ent.setValue(newReference(v));
							return oldVal;
						}

						public boolean equals(Object o) {
							if (o == this)
								return true;
							if (!(o instanceof Map.Entry))
								return false;

							Map.Entry e = (Map.Entry) o;
							return eq(ent.getKey(), e.getKey()) && eq(ent.getValue(), e.getValue());
						}

						public int hashCode() {
							Object key = ent.getKey();
							Object val = ent.getValue();

							return (key == null ? 0 : key.hashCode())
									^ (val == null ? 0 : val.hashCode());
						}

						public String toString() {
							return ent.getKey() + "=" + ent.getValue();
						}
					};
				}
			};
		}

		public int size() {
			reap();
			return set.size();
		}

		public boolean isEmpty() {
			reap();
			return set.isEmpty();
		}

		public boolean contains(Object o) {
			reap();
			return super.contains(o);
		}

		public Object[] toArray() {
			reap();
			return super.toArray();
		}

		public Object[] toArray(Object[] a) {
			reap();
			return super.toArray(a);
		}

		public boolean remove(Object o) {
			reap();
			return super.remove(o);
		}

		public boolean containsAll(Collection c) {
			reap();
			return super.containsAll(c);
		}

		public boolean removeAll(Collection c) {
			reap();
			return super.removeAll(c);
		}

		public boolean retainAll(Collection c) {
			reap();
			return super.retainAll(c);
		}

		public void clear() {
			set.clear();
		}

		public String toString() {
			reap();
			return super.toString();
		}
	}
}