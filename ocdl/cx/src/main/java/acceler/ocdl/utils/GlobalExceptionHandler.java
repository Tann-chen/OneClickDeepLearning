package acceler.ocdl.utils;

import acceler.ocdl.dto.Response;
import acceler.ocdl.exception.OcdlException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = OcdlException.class)
    public Response exceptionsHandling(OcdlException exception) {
        String frontErrorMsg= exception.getMessage();

        return Response.getBuilder()
                .setCode(Response.Code.ERROR)
                .setMessage(frontErrorMsg)
                .build();
    }
}
