import "./SignUp.css";

const SignUp = () => {
  return (
    <section className="sign-up">
      <div className="sign-up-container">
        <h2>Sign Up</h2>
        <p>Create your account to join the community.</p>
        <form>
          <input type="text" placeholder="Username" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
