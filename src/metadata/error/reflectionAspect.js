class ReflectionAspectError extends Error {

}

class ReflectionSubjectNotFoundError extends ReflectionAspectError {

}

class ReflectionFieldNotFoundError extends ReflectionAspectError {

}


module.exports = {
    ReflectionAspectError,
    ReflectionFieldNotFoundError, 
    ReflectionSubjectNotFoundError
}
