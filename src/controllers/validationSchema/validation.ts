import Joi from '@hapi/joi';

class AuthenticationValidationSchema {
    private email = Joi.string().email().required().min(5).max(100);
    private password = Joi.string().alphanum().required().min(6).max(100);
    private userName = Joi.string().alphanum().required().min(6).max(100);
    private gender = Joi.string().pattern(/f|m/).length(1).optional();
    private phone = Joi.string().pattern(/[0-9]/).length(10);
    public emailValidationAsync = (data: unknown): Promise<any> => {
        return this.email.validateAsync(data);
    };
    public passwordValidationAsync = (data: unknown): Promise<any> => {
        return this.password.validateAsync(data);
    };
    public userNameValidationAsync = (data: unknown): Promise<any> => {
        return this.userName.validateAsync(data);
    };
    public genderValidationAsync = (data: unknown): Promise<any> => {
        return this.gender.validateAsync(data);
    };
}
export default AuthenticationValidationSchema;
