"use client";

import React, { useEffect, useState } from"react";
import { Form, Input, Checkbox, Button } from"antd";
import toast from"../../utils/toast";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import { RefreshCcw } from"lucide-react";
import url from"../../url";
import"./adminlogin.css";
import OtpInput from"../common/OtpInput";

export default function AdminLoginForm() {

  const router = useNavigate();
  const [form] = Form.useForm();

  const [step, setStep] = useState("LOGIN");
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, setOtp] = useState("");

  /*  AUTH GUARD  */

  useEffect(() => {

    const raw = localStorage.getItem("edudocs");

    if (raw) {

      try {

        const parsed = JSON.parse(raw);

        if (parsed?.token) {

          toast.warning("You are already logged in!");
          router("/admin-dashboard");

        }

      } catch {

        localStorage.removeItem("edudocs");

      }

    }

  }, [router]);

  /*  RESEND TIMER  */

  useEffect(() => {

    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);

  }, [resendTimer]);

  /*  STEP 1: LOGIN  */

  const handleLogin = async (values) => {

    setLoading(true);

    try {

      const { data } = await axios.post(`${url}/admin/adminLogin`, {
        aemail: values.aemail,
        apassword: values.apassword
      });

      setAdminId(data.adminId);
      setStep("OTP");
      setResendTimer(30);
      setOtp("");

      form.resetFields();

      toast.success("OTP sent to your registered email");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||"Login failed"
      );

    } finally {

      setLoading(false);

    }

  };

  /*  STEP 2: OTP VERIFY  */

  const handleOtpVerify = async (values) => {

    setLoading(true);

    try {

      const { data } = await axios.post(`${url}/admin/verify-otp`, {
        adminId,
        otp: values.otp || otp
      });

      localStorage.setItem(
"edudocs",
        JSON.stringify({
          id: data.admin.id,
          aname: data.admin.aname,
          aemail: data.admin.aemail,
          token: data.token,
          role:"admin"
        })
      );

      toast.success("Login successful");

      router("/admin-dashboard");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||"Invalid OTP"
      );

    } finally {

      setLoading(false);

    }

  };

  /*  AUTO VERIFY OTP  */

  useEffect(() => {
    if (otp.length === 6 && step ==="OTP") {
      form.submit();
    }
  }, [otp, step, form]);

  /*  RESEND OTP  */

  const resendOtp = async () => {

    if (!adminId) {

      toast.error("Session expired. Please login again.");
      setStep("LOGIN");
      return;

    }

    if (resendTimer > 0) return;

    try {

      setLoading(true);

      const { data } = await axios.post(`${url}/admin/resend-login-otp`, {
        adminId
      });

      if (data.success) {

        toast.success(data.message);
        setResendTimer(30);

      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||"Failed to resend OTP"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-page-wrapper">

      <div className="login-card">

        <div className="login-header">

          <h2>
            {step ==="LOGIN"
              ?"Admin Login"
              :"OTP Verification"}
          </h2>

          <p>
            {step ==="LOGIN"
              ?"Welcome back! Please enter your details."
              :"Enter the 6-digit OTP sent to your email."}
          </p>

        </div>

        {/*  LOGIN FORM  */}

        {step ==="LOGIN" && (

          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
            className="login-form"
          >

            <Form.Item
              label="Admin Email"
              name="aemail"
              rules={[
                {
                  required: true,
                  type:"email",
                  message:"Enter valid email"
                }
              ]}
            >

              <Input
                placeholder="admin@draa.in"
                className="custom-input"
              />

            </Form.Item>

            <Form.Item
              label="Password"
              name="apassword"
              rules={[
                { required: true, message:"Enter password" }
              ]}
            >

              <Input.Password
                placeholder=""
                className="custom-input"
              />

            </Form.Item>

            <div className="form-options">

              <Form.Item
                name="remember"
                valuePropName="checked"
                noStyle
              >
                <Checkbox>Remember Me</Checkbox>
              </Form.Item>

            </div>

            <Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="login-submit-btn"
                loading={loading}
                block
              >
                Sign In
              </Button>

            </Form.Item>

          </Form>

        )}

        {/*  OTP FORM  */}

        {step ==="OTP" && (

          <Form
            form={form}
            layout="vertical"
            onFinish={handleOtpVerify}
            autoComplete="off"
            className="login-form"
          >

            <Form.Item
              label="One Time Password"
              name="otp"
            >

              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  form.setFieldsValue({ otp: val });
                }}
                disabled={loading}
                length={6}
              />

            </Form.Item>

            <Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="login-submit-btn"
                loading={loading}
                block
              >
                Verify & Login
              </Button>

            </Form.Item>

            {/* RESEND OTP */}

            <div style={{ textAlign:"center", marginTop: 12 }}>

              <button
                type="button"
                onClick={resendOtp}
                disabled={resendTimer > 0 || loading}
                className="login-submit-btn"
                style={{ width:"100%", padding:"10px" }}
              >

                <RefreshCcw size={16} />

                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  :"Resend OTP"}
              </button>

            </div>
            <br />
            <p className="login-alt-link">

              Wrong email?{""}

              <span
                onClick={() => {
                  setStep("LOGIN");
                  setAdminId(null);
                  setOtp("");
                  form.resetFields();
                }}
                style={{
                  color:"var(--primary)",
                  cursor:"pointer",
                  fontWeight: 600
                }}
              >
                Go back
              </span>

            </p>

          </Form>

        )}

        {/* Teacher login link */}

        <p className="login-alt-link">

          Looking for the Teacher Dashboard?{""}

          <span
            onClick={() => router("/teacher-login")}
            style={{
              color:"var(--primary)",
              cursor:"pointer",
              fontWeight: 600
            }}
          >
            Go here
          </span>

        </p>

      </div>

    </div>

  );
}
