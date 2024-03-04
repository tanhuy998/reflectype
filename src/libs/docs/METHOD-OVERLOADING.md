Apply @overload(nameOfMethodToOverload) decorator for another method.

**DRAFT**
@oveload will check for the situation.

if there are param types exist, overload would locate the param types list to the target method variant param trie.

**INEFFICIENT**
on the other hand, if no param types defined, @overload will mark the method whom it takes effect as a non parameter funciton, after that, any @type decorators applied on that method will locate itself to the target method.
On this case, if there are any @type decorators applied, the overloading state will be decide by the metadata resolution progress.

-----------------------------------------------------------
#### METHOD RESOLUTION STRATEGIES CONSIDERATION

The method variants trie just only been built by the metadata resolution progress.
When undecorated classes inherit decorated classes, every override method without decoration on derived class will be marked as overload version of  it base class's origin method. If that override has exactly the same signature as it's base method, it would be a truely overriden behavior and the evaluation based on the allowance of the base class's method for overriden. 

situations

1. A class define a method that have never been defined on it's base class inheritance chain. [override]
	1. the method is decorated.
		-> build variant trie for it.
	2. the method is not decorated.
		-> just leave it.
2. A class define a method with the same name as it's base class method without decoration.
	1. base class method was not decorated. (variant trie have not been built for bot of the two methods, both owned and owner, and it's hard and complicated to reproduce propMeta for both).
		-> just leave it act as the default override behavior of javascript.
	2. base class method was decorated (variant trie was built, easy to lookup but reproduce propMeta for undecorated method will make mistake).
		-> throw error for this case.
3. A class define a method with the same name as its base class method with decoration.
	1. base class method was not decorated.
		-> overriden base class method.
	2. base class method was decorated.
		1.  the two method have similar signatures.
			1. base class method allows overriden.
				-> search for the trie endpoint and define footprint on this node.
			2. base class method not allow overriden.
				-> throw error.
		2.  the two method have different signatures.
			-> merge the new one to variant trie.
	
4. A class define a pseudo method that is annotated to overload one of it's class method. (similar to 3).
	1. the overloaded method is owned by it's owner base class. (not effective)
	2. the overloaded method is owned by it's owner class. (not effective)
-> pseudo function just lookup on the variant trie to find which method it oveloads so just be sure the target method was decorated before the pseudo method is define no matter whose owner of the target of overload method is.

#### METHOD RESOLUTION EVALUATION STRATEGIES CONSIDERATION



------------------------------------------------------------
#### METHOD DECISION INVOCATION

All decorated class's methods have an entry point that.

Entry point invoked -> get the current class of the object that bound the method -> lookup method signature in variant trie to find matched endpoint -> lookup again on the endpoint object by using the current class as key to get the exact method variant. 