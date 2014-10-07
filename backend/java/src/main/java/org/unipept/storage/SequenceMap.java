package org.unipept.storage;

import java.util.Set;
import java.util.Map;
import java.util.AbstractMap;

import org.mapdb.DBMaker;
import org.mapdb.HTreeMap;
import org.mapdb.BTreeMap;

public class SequenceMap extends AbstractMap<String, Integer> {

    private final HTreeMap<String, Integer> cache;
    private final BTreeMap<String, Integer> storage;

    public SequenceMap() {
        cache = DBMaker.newCache(1);
        storage = DBMaker.newTempTreeMap();
    }

    @Override
    public Integer put(String key, Integer value) {
        Integer old = cache.put(key, value);
        if(old == null) {
            old = storage.put(key, value);
            if(old != null) cache.put(key, old);
            return old;
        } else {
            return old;
        }
    }

    @Override
    public boolean containsKey(Object key) {
        return cache.containsKey(key) || storage.containsKey(key);
    }

    @Override
    public Integer get(Object key) {
        Integer value = cache.get(key);
        if(value == null) {
            value = storage.get(key);
            cache.put(key.toString(), value);
            return value;
        } else {
            return value;
        }
    }

    @Override
    public Set<Map.Entry<String, Integer>> entrySet() {
        Set<Map.Entry<String, Integer>> set = cache.entrySet();
        set.addAll(storage.entrySet());
        return set;
    }

}
