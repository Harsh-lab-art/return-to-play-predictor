-- Create athlete profiles table
CREATE TABLE public.athlete_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  sport TEXT NOT NULL,
  position TEXT,
  phone_number TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create injuries table
CREATE TABLE public.injuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES public.athlete_profiles(id) ON DELETE CASCADE NOT NULL,
  injury_type TEXT NOT NULL,
  injury_location TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe')),
  injury_date DATE NOT NULL,
  mechanism TEXT,
  symptoms TEXT,
  imaging_results TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'recovering', 'recovered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create medical reports table
CREATE TABLE public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  injury_id UUID REFERENCES public.injuries(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.athlete_profiles(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  extracted_text TEXT,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create recovery recommendations table
CREATE TABLE public.recovery_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  injury_id UUID REFERENCES public.injuries(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.athlete_profiles(id) ON DELETE CASCADE NOT NULL,
  predicted_rtp_days_min INTEGER NOT NULL,
  predicted_rtp_days_max INTEGER NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  rest_days_recommended INTEGER NOT NULL,
  daily_calories INTEGER NOT NULL,
  daily_protein_grams INTEGER NOT NULL,
  key_risk_factors JSONB,
  rehabilitation_phases JSONB,
  clinical_notes TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for athlete_profiles
CREATE POLICY "Users can view their own profile"
  ON public.athlete_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.athlete_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.athlete_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for injuries
CREATE POLICY "Users can view their own injuries"
  ON public.injuries FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own injuries"
  ON public.injuries FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own injuries"
  ON public.injuries FOR UPDATE
  USING (
    athlete_id IN (
      SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for medical_reports
CREATE POLICY "Users can view their own medical reports"
  ON public.medical_reports FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own medical reports"
  ON public.medical_reports FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for recovery_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.recovery_recommendations FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own recommendations"
  ON public.recovery_recommendations FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid()
    )
  );

-- Create storage bucket for medical reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-reports',
  'medical-reports',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies for medical reports bucket
CREATE POLICY "Users can upload their own medical reports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-reports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own medical reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own medical reports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical-reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_athlete_profiles_updated_at
  BEFORE UPDATE ON public.athlete_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_injuries_updated_at
  BEFORE UPDATE ON public.injuries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_injuries_athlete_id ON public.injuries(athlete_id);
CREATE INDEX idx_injuries_status ON public.injuries(status);
CREATE INDEX idx_medical_reports_injury_id ON public.medical_reports(injury_id);
CREATE INDEX idx_medical_reports_athlete_id ON public.medical_reports(athlete_id);
CREATE INDEX idx_recovery_recommendations_injury_id ON public.recovery_recommendations(injury_id);
CREATE INDEX idx_recovery_recommendations_athlete_id ON public.recovery_recommendations(athlete_id);